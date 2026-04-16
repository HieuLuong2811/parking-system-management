import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { SoftDataGrid } from '../components/common/SoftDataGrid';
import { RoleSelector } from '../components/users/RoleSelector';
import { ImportUsersDialog } from '../components/users/ImportUsersDialog';
import { DrawerUserSubscription } from '../components/users/DrawerUserSubscription';
import { UserFormDialog } from '../components/users/UserFormDialog';
import type { UserFormValues, UserFormMode } from '../components/users/UserFormDialog';
import {
  useCreateUser,
  useDeleteUser,
  useFetchUsers,
  useUpdateUser,
} from '../api/users';
import type { AdminUser } from '../api/types';
import { useSubscriptionSearch } from '../api/subscriptions';
import { useAdminRoles } from '../api/roles';
import { defaultUserFormValues } from '../constant/userForm';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

type ToastState = {
  severity: 'success' | 'error';
  message: string;
} | null;

type Anchor = 'top' | 'left' | 'bottom' | 'right';

export const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const navigate = useNavigate();

  type RequiredUserFormField = 'user_code' | 'full_name' | 'email';
  const requiredFieldKeys: RequiredUserFormField[] = ['user_code', 'full_name', 'email'];

  const fieldLabels = useMemo<Record<RequiredUserFormField, string>>(
    () => ({
      user_code: t('usersPage.form.userCode'),
      full_name: t('usersPage.form.fullName'),
      email: t('usersPage.form.email'),
    }),
    [t]
  );

  const buildRequiredError = (field: RequiredUserFormField) =>
    t('validation.requiredField', { field: fieldLabels[field] });

  const [state, setState] = useState<Record<Anchor, boolean>>({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [formState, setFormState] = useState<{ open: boolean; mode: UserFormMode; values: UserFormValues }>({
    open: false,
    mode: 'create',
    values: defaultUserFormValues,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({});
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [importDialog, setImportDialog] = useState<{ roleCode: string; roleLabel: string } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusTab, setStatusTab] = useState<'active' | 'inactive'>('active');
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 450);
  const debouncedPhoneFilter = useDebouncedValue(phoneFilter, 450);
  const debouncedRoleFilter = useDebouncedValue(roleFilter, 450);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setPhoneFilter('');
    setRoleFilter('');
  }, []);

  const handleTabChange = useCallback((_: React.SyntheticEvent, value: 'active' | 'inactive') => {
    setStatusTab(value);
  }, []);

  const filters = useMemo(
    () => ({
      search: debouncedSearchTerm || undefined,
      phone: debouncedPhoneFilter || undefined,
      role: debouncedRoleFilter || undefined,
      is_deleted: statusTab === 'inactive',
    }),
    [debouncedSearchTerm, debouncedPhoneFilter, debouncedRoleFilter, statusTab]
  );

  const { data: usersWithRoles = [], isLoading } = useFetchUsers(filters);
  const { data: subscriptionRows = [], isLoading: isSubscriptionsLoading } = useSubscriptionSearch();
  const { data: availableRoles = [] } = useAdminRoles();

  const users = useMemo(() => usersWithRoles.map(({ user, roles }) => ({ ...user, roles })), [usersWithRoles]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);

  const toggleDrawer = useCallback((anchor: Anchor, open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setState((prev) => ({ ...prev, [anchor]: open }));
    if (!open) {
      setSelectedUser(null);
    }
  }, []);

  const openSubscriptionsDrawer = useCallback((user: AdminUser) => {
    setSelectedUser(user);
    setState((prev) => ({ ...prev, right: true }));
  }, []);

  const handleViewSubscriptions = useCallback(() => {
    setState((prev) => ({ ...prev, right: false }));
    setSelectedUser(null);
    navigate('/subscriptions');
  }, [navigate]);

  const sortedRows = useMemo(() => {
    if (!sortConfig) return users;
    const { field, direction } = sortConfig;
    const getValue = (user: AdminUser) => {
      if (field === 'status') {
        return user.deleted_at ? '1' : '0';
      }
      return String((user as Record<string, unknown>)[field] ?? '').toLowerCase();
    };
    return [...users].sort((a, b) => {
      const aValue = getValue(a);
      const bValue = getValue(b);
      if (aValue === bValue) return 0;
      return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });
  }, [users, sortConfig]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, page, rowsPerPage]);

  const openCreateForm = useCallback(() => {
    setEditingUser(null);
    setFormState({ open: true, mode: 'create', values: defaultUserFormValues });
    setFormErrors({});
  }, []);

  const openEditForm = useCallback((user: AdminUser) => {
    setEditingUser(user);
    setFormState({
      open: true,
      mode: 'edit',
      values: {
        user_code: user.user_code,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number ?? "",
      },
    });
    setFormErrors({});
  }, []);

  const closeForm = () => {
    setFormState((prev) => ({ ...prev, open: false }));
    setFormErrors({});
  };

  const handleFormChange = (field: keyof UserFormValues, value: string | boolean) => {
    setFormState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [field]: value,
      },
    }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleFormSubmit = () => {
    const nextErrors: typeof formErrors = {};
    requiredFieldKeys.forEach((field) => {
      const value = formState.values[field];
      const normalized = typeof value === 'string' ? value.trim() : String(value ?? '').trim();
      if (!normalized) {
        nextErrors[field] = buildRequiredError(field);
      }
    });
    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors);
      return;
    }
    setFormErrors({});

    const payload: Record<string, unknown> = {
      user_code: formState.values.user_code,
      full_name: formState.values.full_name,
      email: formState.values.email,
      phone_number: formState.values.phone_number,
    };

    if (formState.mode === 'create') {
      createMutation.mutate(payload as Parameters<typeof createMutation.mutate>[0], {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
          setToast({
            severity: 'success',
            message: t('usersPage.actions.created', { user: payload.user_code }),
          });
          closeForm();
        },
        onError: (error: unknown) => {
          setToast({
            severity: 'error',
            message: error instanceof Error ? error.message : t('usersPage.actions.error'),
          });
        },
      });
      return;
    }

    if (!editingUser) return;
    const updatePayload: Record<string, unknown> = {
      full_name: payload.full_name,
      email: payload.email,
      phone_number: payload.phone_number,
    };

    updateMutation.mutate(
      { userCode: editingUser.user_code, payload: updatePayload },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
          setToast({
            severity: 'success',
            message: t('usersPage.actions.updated', { user: editingUser.user_code }),
          });
          closeForm();
        },
        onError: (error: unknown) => {
          setToast({
            severity: 'error',
            message: error instanceof Error ? error.message : t('usersPage.actions.error'),
          });
        },
      }
    );
  };

  const handleDeleteUser = useCallback(
    (user: AdminUser) => {
      if (!window.confirm(t('usersPage.actions.deleteConfirm', { user: user.user_code }))) {
        return;
      }
      deleteMutation.mutate(user.user_code, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
          setToast({ severity: 'success', message: t('usersPage.actions.deleted', { user: user.user_code }) });
        },
        onError: (error: unknown) => {
          setToast({
            severity: 'error',
            message: error instanceof Error ? error.message : t('usersPage.actions.error'),
          });
        },
      });
    },
    [t, queryClient, deleteMutation]
  );

  const notifyRoleChange = useCallback((severity: 'success' | 'error', message: string) => {
    setToast({ severity, message });
  }, []);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'user_code',
        headerName: t('usersPage.columns.userCode'),
        minWidth: 170,
        sortable: true,
      },
      {
        field: 'full_name',
        headerName: t('usersPage.columns.fullName'),
        minWidth: 220,
        flex: 1,
        sortable: true,
      },
      {
        field: 'email',
        headerName: t('usersPage.columns.email'),
        minWidth: 220,
        flex: 1,
        sortable: true,
      },
      {
        field: 'phone_number',
        headerName: t('usersPage.columns.phoneNumber'),
        minWidth: 180,
        sortable: true,
      },
      {
        field: 'status',
        headerName: t('usersPage.columns.active'),
        minWidth: 140,
        sortable: true,
        valueGetter: (__value, row) => (row?.deleted_at == null ? 'deleted' : 'active'),
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.row?.deleted_at == null
            ? t('usersPage.columns.status.active')
            : t('usersPage.columns.status.deleted')}
            color={params.row?.deleted_at == null ? 'success' : 'default'}
          />
        ),
      },
      {
        field: 'roles',
        headerName: t('usersPage.columns.role'),
        width: 260,
        sortable: false,
        renderCell: (params) => (
          <RoleSelector
            userCode={params.row.user_code}
            roles={params.row.roles ?? []}
            onNotify={notifyRoleChange}
          />
        ),
      },
      {
        field: 'actions',
        headerName: t('usersPage.columns.actions'),
        minWidth: 160,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            <IconButton size="small" onClick={() => openSubscriptionsDrawer(params.row as AdminUser)}>
              <FormatListBulletedIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => openEditForm(params.row as AdminUser)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => handleDeleteUser(params.row as AdminUser)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ),
      },
    ],
    [t, notifyRoleChange, openEditForm, handleDeleteUser, openSubscriptionsDrawer]
  );

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortConfig({ field, direction });
    setPage(0);
  };

  const openImportDialog = () => {
    setImportDialog({ roleCode: 'user', roleLabel: t('usersPage.importModal.title') });
  };

  const handleImportSuccess = (imported: number, skipped: number) => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'], exact: false });
    setToast({
      severity: 'success',
      message: t('usersPage.importModal.toast.success', { count: imported, skipped }),
    });
  };

  const handleImportError = (message: string) => {
    setToast({ severity: 'error', message });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5">{t('usersPage.title')}</Typography>
        </Box>
      </Stack>

      <Tabs
        value={statusTab}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label={t('usersPage.columns.status.active')} value="active" />
        <Tab label={t('usersPage.columns.status.inactive')} value="inactive" />
      </Tabs>

      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <TextField
              size="small"
              variant="outlined"
              placeholder={t('placeHolder.search')}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <TextField
              size="small"
              variant="outlined"
              placeholder="Phone number"
              value={phoneFilter}
              onChange={(event) => setPhoneFilter(event.target.value)}
            />
            <FormControl sx={{ minWidth: 160 }} size="small">
              <InputLabel shrink>{t('usersPage.filters.role')}</InputLabel>
              <Select
                value={roleFilter}
                displayEmpty
                onChange={(event) => setRoleFilter(event.target.value)}
                label={t('usersPage.filters.role')}
              >
                <MenuItem value="">{t('usersPage.filters.allRoles')}</MenuItem>
                {availableRoles.map((role) => (
                  <MenuItem key={role.id} value={role.role_code}>
                    {role.role_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button size="small" variant="text" onClick={handleClearFilters}>
              {t('button.clear')}
            </Button>
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={openImportDialog}>
            {t('usersPage.importModal.title')}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateForm}>
            {t('usersPage.actions.createButton')}
          </Button>
        </Stack>
      </Stack>

      <Drawer anchor="right" open={state.right} onClose={toggleDrawer('right', false)}>
        <Box
          sx={{
            width: { xs: 320, sm: 380 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: 3,
          }}
        >
          <DrawerUserSubscription
            selectedUser={selectedUser}
            subscriptionRows={subscriptionRows ?? []}
            isLoading={isSubscriptionsLoading}
            onViewSubscriptions={handleViewSubscriptions}
          />
        </Box>
      </Drawer>

      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <SoftDataGrid
          rows={paginatedRows}
          columns={columns}
          loading={isLoading}
          maxHeight={520}
          onSort={handleSort}
          sortConfig={sortConfig ?? undefined}
        />
        <TablePagination
          component="div"
          count={sortedRows.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            const value = Number(event.target.value);
            if (!Number.isNaN(value)) {
              setRowsPerPage(value);
              setPage(0);
            }
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
        />
      </Paper>

      {importDialog && (
        <ImportUsersDialog
          open
          roleCode={importDialog.roleCode}
          roleLabel={importDialog.roleLabel}
          onClose={() => setImportDialog(null)}
          onImported={({ imported, skipped }) => {
            handleImportSuccess(imported, skipped);
            setImportDialog(null);
          }}
          onError={(message) => handleImportError(message)}
        />
      )}

      <UserFormDialog
        open={formState.open}
        mode={formState.mode}
        values={formState.values}
        loading={isLoading}
        onClose={closeForm}
        onChange={handleFormChange}
        onSubmit={handleFormSubmit}
        errors={formErrors}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {toast ? (
          <Alert onClose={() => setToast(null)} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
};
