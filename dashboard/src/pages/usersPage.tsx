import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import FilterListIcon from '@mui/icons-material/FilterList';
import { SoftDataGrid } from '../components/common/SoftDataGrid';
import { RoleSelector } from '../components/users/RoleSelector';
import { RoleSelectField } from '../components/users/RoleSelectField';
import { ImportUsersDialog } from '../components/users/ImportUsersDialog';
import { UserFormDialog } from '../components/users/UserFormDialog';
import type { UserFormValues, UserFormMode } from '../components/users/UserFormDialog';
import {
  useCreateUser,
  useDeleteUser,
  useFetchUsers,
  useUpdateUser,
} from '../api/users';
import type { AdminUser, RoleSummary } from '../api/types';
import { useAdminRoles } from '../api/roles';
import { useAssignUserRole } from '../api/userRoles';
import { defaultUserFormValues } from '../constant/userForm';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { PageHeader } from '../components/common/PageHeader';

type ToastState = {
  severity: 'success' | 'error';
  message: string;
} | null;

type UserFiltersState = {
  nameEmail: string;
  phone: string;
  userCode: string;
  role: string;
};

type UserFormState = {
  open: boolean;
  mode: UserFormMode;
  values: UserFormValues;
  errors: Partial<Record<keyof UserFormValues, string>>;
  editingUser: AdminUser | null;
};

export const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const assignRoleMutation = useAssignUserRole();
  const navigate = useNavigate();

  type RequiredUserFormField = 'user_code' | 'full_name' | 'email' | 'password';
  const requiredFieldKeys: RequiredUserFormField[] = ['user_code', 'full_name', 'email', 'password'];

  const fieldLabels = useMemo<Record<RequiredUserFormField, string>>(
    () => ({
      user_code: t('usersPage.form.userCode'),
      full_name: t('usersPage.form.fullName'),
      email: t('usersPage.form.email'),
      password: t('usersPage.form.password', { defaultValue: 'Password' }),
    }),
    [t]
  );

  const buildRequiredError = (field: RequiredUserFormField) =>
    t('validation.requiredField', { field: fieldLabels[field] });

  const [form, setForm] = useState<UserFormState>({
    open: false,
    mode: 'create',
    values: defaultUserFormValues,
    errors: {},
    editingUser: null,
  });
  const [toast, setToast] = useState<ToastState>(null);
  const [importOpen, setImportOpen] = useState(false);

  const [filters, setFilters] = useState<UserFiltersState>({
    nameEmail: '',
    phone: '',
    userCode: '',
    role: '',
  });
  const [statusTab, setStatusTab] = useState<'active' | 'inactive'>('active');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const debouncedUserCodeFilter = useDebouncedValue(filters.userCode, 450);
  const debouncedNameEmailFilter = useDebouncedValue(filters.nameEmail, 450);
  const debouncedPhoneFilter = useDebouncedValue(filters.phone, 450);
  const debouncedRoleFilter = useDebouncedValue(filters.role, 450);

  const updateFilters = useCallback((updater: (prev: UserFiltersState) => UserFiltersState) => {
    setFilters((prev) => updater(prev));
    setPage(0);
  }, []);

  const handleClearFilters = useCallback(() => {
    updateFilters(() => ({
      nameEmail: '',
      phone: '',
      userCode: '',
      role: '',
    }));
  }, [updateFilters]);

  const handleTabChange = useCallback((_: React.SyntheticEvent, value: 'active' | 'inactive') => {
    setStatusTab(value);
    setPage(0);
  }, []);

  const queryFilters = useMemo(
    () => ({
      user_code: debouncedUserCodeFilter?.trim() || undefined,
      nameOrEmail: debouncedNameEmailFilter?.trim() || undefined,
      phone: debouncedPhoneFilter?.trim() || undefined,
      role: debouncedRoleFilter?.trim() || undefined,
      is_deleted: statusTab === 'inactive',
      page: page + 1,
      limit: rowsPerPage,
    }),
    [debouncedNameEmailFilter, debouncedPhoneFilter, debouncedRoleFilter, statusTab, page, rowsPerPage, debouncedUserCodeFilter]
  );

  const { data: paginatedData, isLoading } = useFetchUsers(queryFilters);

  const usersWithRoles = useMemo(() => 
    paginatedData?.data ?? [],
    [paginatedData]
  )
  const totalUsers = paginatedData?.total ?? 0;

  const { data: availableRoles = [] } = useAdminRoles();
  const importRoleCode = 'user';
  const importRoleLabel = t('usersPage.importModal.title');

  const users = useMemo(() => 
    usersWithRoles.map(({ user, roles } : {user: AdminUser, roles: RoleSummary[]}) => ({ ...user, roles })), 
    [usersWithRoles]
  );

  const handleViewProfile = useCallback((user: AdminUser) => {
    navigate(`/users/${user.user_code}/user-details`);
  }, [navigate]);

  const openCreateForm = useCallback(() => {
    setForm({
      open: true,
      mode: 'create',
      values: defaultUserFormValues,
      errors: {},
      editingUser: null,
    });
  }, []);

  const openEditForm = useCallback((user: AdminUser) => {
    setForm({
      open: true,
      mode: 'edit',
      values: {
        user_code: user.user_code,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number ?? "",
        role_id: "",
      },
      errors: {},
      editingUser: user,
    });
  }, []);

  const closeForm = () => {
    setForm((prev) => ({ ...prev, open: false, errors: {} }));
  };

  const handleFormChange = (field: keyof UserFormValues, value: string | boolean) => {
    setForm((prev) => {
      const nextErrors = { ...prev.errors };
      delete nextErrors[field];
      return {
        ...prev,
        values: {
          ...prev.values,
          [field]: value,
        },
        errors: nextErrors,
      };
    });
  };

  const handleFormSubmit = () => {
    const nextErrors: UserFormState['errors'] = {};
    requiredFieldKeys
      .filter((field) => (form.mode === 'create' ? true : field !== 'password'))
      .forEach((field) => {
      const value = form.values[field];
      const normalized = typeof value === 'string' ? value.trim() : String(value ?? '').trim();
      if (!normalized) {
        nextErrors[field] = buildRequiredError(field);
      }
    });
    if (Object.keys(nextErrors).length) {
      setForm((prev) => ({ ...prev, errors: nextErrors }));
      return;
    }
    setForm((prev) => ({ ...prev, errors: {} }));

    const payload: Record<string, unknown> = {
      user_code: form.values.user_code,
      full_name: form.values.full_name,
      email: form.values.email,
      phone_number: form.values.phone_number,
    };

    if (form.mode === 'create') {
      (payload).password = form.values.password;
      createMutation.mutate(payload as Parameters<typeof createMutation.mutate>[0], {
        onSuccess: async () => {
          const roleId = String(form.values.role_id || '').trim();
          if (roleId) {
            try {
              await assignRoleMutation.mutateAsync({
                user_code: String(payload.user_code),
                role_id: roleId,
              });
            } catch (error) {
              setToast({
                severity: 'error',
                message:
                  error instanceof Error
                    ? error.message
                    : t('usersPage.actions.error'),
              });
              // keep going; user already created
            }
          }
          queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
          setToast({
            severity: 'success',
            message: t('usersPage.actions.created', { user: payload.user_code }),
          });
          closeForm();
        },
        onError: (error: unknown) => {
          if (axios.isAxiosError(error)) {
            const detail = (error.response?.data)?.detail;
            const field = detail?.field as keyof UserFormValues | undefined;
            const message = (detail?.message as string | undefined) ?? error.message;
            if (field && message) {
              setForm((prev) => ({
                ...prev,
                errors: { ...prev.errors, [field]: message },
              }));
              return;
            }
          }
          setToast({
            severity: 'error',
            message: error instanceof Error ? error.message : t('usersPage.actions.error'),
          });
        },
      });
      return;
    }

    if (!form.editingUser) return;
    const updatePayload: Record<string, unknown> = {
      full_name: payload.full_name,
      email: payload.email,
      phone_number: payload.phone_number,
    };

    updateMutation.mutate(
      { userCode: form.editingUser.user_code, payload: updatePayload },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
          setToast({
            severity: 'success',
            message: t('usersPage.actions.updated', { user: form.editingUser!.user_code }),
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
      const confirmMessage =
        user.deleted_at == null
          ? t('usersPage.actions.deleteConfirmActiveWarning', { user: user.user_code })
          : t('usersPage.actions.deleteConfirm', { user: user.user_code });

      if (!window.confirm(confirmMessage)) {
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
        sortable: false,
      },
      {
        field: 'full_name',
        headerName: t('usersPage.columns.fullName'),
        minWidth: 220,
        flex: 1,
        sortable: false,
      },
      {
        field: 'email',
        headerName: t('usersPage.columns.email'),
        minWidth: 220,
        flex: 1,
        sortable: false,
      },
      {
        field: 'phone_number',
        headerName: t('usersPage.columns.phoneNumber'),
        minWidth: 180,
        sortable: false,
      },
      {
        field: 'status',
        headerName: t('usersPage.columns.active'),
        minWidth: 140,
        sortable: false,
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
            <IconButton size="small" onClick={() => handleViewProfile(params.row as AdminUser)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => openEditForm(params.row as AdminUser)}>
              <EditIcon fontSize="small" />
            </IconButton>
            {params.row.roles?.some((role: RoleSummary) => role.role_code === 'user') && (
              <IconButton size="small" onClick={() => handleDeleteUser(params.row as AdminUser)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        ),
      },
    ],
    [t, notifyRoleChange, openEditForm, handleDeleteUser, handleViewProfile]
  );

  const openImportDialog = () => {
    setImportOpen(true);
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
        <PageHeader title={t('usersPage.title')} subtitle={t('usersPage.description')} />
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
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <FilterListIcon color="action" />
              <Typography variant="body2">{t('common.filters.search')}</Typography>
            </Box>
            <TextField
              size="small"
              variant="outlined"
              value={filters.userCode}
              label={t('usersPage.filters.userCode')}
              onChange={(event) => {
                const nextValue = event.target.value.replace(/\D+/g, '');
                updateFilters((prev) => ({ ...prev, userCode: nextValue }));
              }}
              type="text"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
            <TextField
              size="small"
              variant="outlined"
              value={filters.nameEmail}
              label={t('usersPage.filters.nameOrEmail')}
              onChange={(event) => {
                updateFilters((prev) => ({ ...prev, nameEmail: event.target.value }));
              }}
            />
            <TextField
              size="small"
              variant="outlined"
              value={filters.phone}
              label={t('usersPage.filters.phoneNumber')}
              onChange={(event) => {
                const nextValue = event.target.value.replace(/\D+/g, '');
                updateFilters((prev) => ({ ...prev, phone: nextValue }));
              }}
              type="text"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
            <RoleSelectField
              label={t('usersPage.filters.role')}
              value={filters.role}
              options={availableRoles}
              valueKey="role_code"
              includeAllOption
              allLabel={t('usersPage.filters.allRoles')}
              onChange={(next) => updateFilters((prev) => ({ ...prev, role: next }))}
            />
            <Button variant="text" onClick={handleClearFilters}>
              {t('common.filters.reset')}
            </Button>
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={openImportDialog}>
            {t('usersPage.importModal.title')}
          </Button>
          <Button variant="contained" onClick={openCreateForm}>
            {t('usersPage.actions.createButton')}
          </Button>
        </Stack>
      </Stack>

      <Paper elevation={0}>
        <SoftDataGrid
          rows={users}
          columns={columns}
          loading={isLoading}
          maxHeight={520}
          // onSort={handleSort}
          // sortConfig={sortConfig ?? undefined}
        />
        <TablePagination
          component="div"
          count={totalUsers}
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

      {importOpen && (
        <ImportUsersDialog
          open
          roleCode={importRoleCode}
          roleLabel={importRoleLabel}
          onClose={() => setImportOpen(false)}
          onImported={({ imported, skipped }) => {
            handleImportSuccess(imported, skipped);
            setImportOpen(false);
          }}
          onError={(message) => handleImportError(message)}
        />
      )}

      <UserFormDialog
        open={form.open}
        mode={form.mode}
        values={form.values}
        loading={isLoading}
        availableRoles={availableRoles}
        onClose={closeForm}
        onChange={handleFormChange}
        onSubmit={handleFormSubmit}
        errors={form.errors}
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
