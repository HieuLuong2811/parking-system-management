import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import * as XLSX from 'xlsx';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { importUsers } from '../api/resources';
import { SoftDataGrid } from '../components/common/SoftDataGrid';
import {
  useFetchUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '../api/users';
import type { AdminUser } from '../api/types';

type FilterStatus = 'all' | 'valid' | 'invalid';
type ImportRowError = 'missingUserCode' | 'missingEmail' | 'invalidEmail';

type ParsedUserEntry = {
  user_code: string;
  full_name: string;
  email: string;
  errors: ImportRowError[];
  isValid: boolean;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type UserFormValues = {
  user_code: string;
  full_name: string;
  email: string;
  language_use?: string;
  is_active: boolean;
  password?: string;
};

const defaultUserFormValues: UserFormValues = {
  user_code: '',
  full_name: '',
  email: '',
  language_use: '',
  is_active: true,
  password: '',
};

const normalizeValue = (value: unknown) =>
  typeof value === 'string' ? value.trim() : String(value ?? '').trim();

const parseExcelFile = async (file: File): Promise<ParsedUserEntry[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' });

  return rows.map((row) => {
    const userCode =
      normalizeValue(row.user_code) ||
      normalizeValue(row['Mã sinh viên']) ||
      normalizeValue(row['Mã giảng viên']) ||
      '';
    const fullName =
      normalizeValue(row.full_name) ||
      normalizeValue(row['Họ và tên']) ||
      '';
    const email =
      normalizeValue(row.email) ||
      normalizeValue(row.Email) ||
      normalizeValue(row.EMail) ||
      '';

    const errors: ImportRowError[] = [];
    if (!userCode) {
      errors.push('missingUserCode');
    }
    if (!email) {
      errors.push('missingEmail');
    } else if (!EMAIL_REGEX.test(email)) {
      errors.push('invalidEmail');
    }

    return {
      user_code: userCode,
      full_name: fullName || userCode,
      email,
      errors,
      isValid: errors.length === 0,
    };
  });
};

interface ImportUsersDialogProps {
  open: boolean;
  roleCode: string;
  roleLabel: string;
  onClose: () => void;
  onImported: (result: { imported: number; skipped: number }) => void;
  onError: (message: string) => void;
}

const ImportUsersDialog: React.FC<ImportUsersDialogProps> = ({
  open,
  roleCode,
  roleLabel,
  onClose,
  onImported,
  onError,
}) => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<ParsedUserEntry[]>([]);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isImporting, setIsImporting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      setRows([]);
      setStatusFilter('all');
      setSearchTerm('');
      setPage(0);
      setRowsPerPage(5);
      setLoadError('');
      setFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoadError('');
    try {
      const parsed = await parseExcelFile(file);
      setRows(parsed);
      setPage(0);
      setFileName(file.name);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('usersPage.importModal.toast.error', { message: 'Unable to read file' });
      setLoadError(errorMessage);
    } finally {
      event.target.value = '';
    }
  };

  const validRows = useMemo(() => rows.filter((row) => row.isValid), [rows]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'valid' && row.isValid) ||
        (statusFilter === 'invalid' && !row.isValid);
      if (!matchesStatus) {
        return false;
      }
      if (!normalizedSearch) {
        return true;
      }
      return (
        row.user_code.toLowerCase().includes(normalizedSearch) ||
        row.full_name.toLowerCase().includes(normalizedSearch) ||
        row.email.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [rows, searchTerm, statusFilter]);

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= filteredRows.length) {
      setPage(0);
    }
  }, [filteredRows.length, page, rowsPerPage]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const invalidCount = rows.length - validRows.length;

  const renderErrors = (errors: ImportRowError[]) =>
    errors.map((error) => t(`usersPage.importModal.errors.${error}`)).join(', ');

  const handleStatusChange = (event: SelectChangeEvent<FilterStatus>) => {
    setStatusFilter(event.target.value as FilterStatus);
    setPage(0);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleImport = async () => {
    if (!validRows.length) {
      onError(t('usersPage.importModal.toast.noValidRows'));
      return;
    }
    setIsImporting(true);
    try {
      const payload = {
        entries: validRows.map((row) => ({
          user_code: row.user_code,
          full_name: row.full_name,
          email: row.email,
        })),
      };
      const response = await importUsers(roleCode, payload);
      onImported({
        imported: response.length,
        skipped: invalidCount,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t('usersPage.importModal.toast.error', { message: 'Unexpected error' });
      onError(message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} fullWidth maxWidth="lg" onClose={onClose}>
      <DialogTitle>{t('usersPage.importModal.title', { role: roleLabel })}</DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity="info" variant="outlined">
          {t('usersPage.importModal.description', { role: roleLabel })}
        </Alert>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: 'flex-start',
          }}
        >
          <Stack spacing={2} sx={{ flex: 1 }}>
            <TextField
              label={t('usersPage.importModal.searchPlaceholder')}
              placeholder={t('usersPage.importModal.searchPlaceholder')}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              size="small"
              variant="outlined"
            />
            <FormControl fullWidth size="small">
              <InputLabel id="import-status-label">{t('usersPage.importModal.statusLabel')}</InputLabel>
              <Select
                labelId="import-status-label"
                label={t('usersPage.importModal.statusLabel')}
                value={statusFilter}
                onChange={handleStatusChange}
              >
                <MenuItem value="all">{t('usersPage.importModal.statusOptions.all')}</MenuItem>
                <MenuItem value="valid">{t('usersPage.importModal.statusOptions.valid')}</MenuItem>
                <MenuItem value="invalid">{t('usersPage.importModal.statusOptions.invalid')}</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Stack spacing={1} alignItems="flex-end" sx={{ width: { xs: '100%', md: 'auto' } }}>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button variant="contained" onClick={handleFileClick}>
              {t('usersPage.importModal.selectFile')}
            </Button>
            {fileName && (
              <Typography variant="body2" color="text.secondary">
                {t('usersPage.importModal.selectedFile', { name: fileName })}
              </Typography>
            )}
          </Stack>
        </Box>

        {loadError && (
          <Alert severity="error" variant="outlined">
            {loadError}
          </Alert>
        )}

        {invalidCount > 0 && (
          <Alert severity="warning" variant="outlined">
            {t('usersPage.importModal.warning.partial', { invalidCount })}
          </Alert>
        )}

        <Paper variant="outlined" sx={{ maxHeight: 360, overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 360 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('usersPage.importModal.tableHeaders.userCode')}</TableCell>
                  <TableCell>{t('usersPage.importModal.tableHeaders.fullName')}</TableCell>
                  <TableCell>{t('usersPage.importModal.tableHeaders.email')}</TableCell>
                  <TableCell>{t('usersPage.importModal.tableHeaders.status')}</TableCell>
                  <TableCell>{t('usersPage.importModal.tableHeaders.errors')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        {t('usersPage.importModal.noRows')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row, index) => (
                    <TableRow key={`${row.user_code || 'row'}-${index}`} hover>
                      <TableCell>{row.user_code || '-'}</TableCell>
                      <TableCell>{row.full_name || '-'}</TableCell>
                      <TableCell>{row.email || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            row.isValid
                              ? t('usersPage.importModal.statusTags.valid')
                              : t('usersPage.importModal.statusTags.invalid')
                          }
                          color={row.isValid ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {row.errors.length ? renderErrors(row.errors) : '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredRows.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 20, 50]}
            labelRowsPerPage={t('usersPage.importModal.pagination')}
          />
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isImporting}>
          {t('usersPage.importModal.footer.cancel')}
        </Button>
        <Button variant="contained" onClick={handleImport} disabled={isImporting || !validRows.length}>
          {t('usersPage.importModal.footer.import')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type UserFormMode = 'create' | 'edit';

interface UserFormDialogProps {
  open: boolean;
  mode: UserFormMode;
  values: UserFormValues;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (field: keyof UserFormValues, value: string | boolean) => void;
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({ open, mode, values, loading, onClose, onSubmit, onChange }) => {
  const { t } = useTranslation();
  const isCreate = mode === 'create';

  return (
    <Dialog open={open} fullWidth maxWidth="sm" onClose={onClose}>
      <DialogTitle>
        {isCreate ? t('usersPage.actions.createDialogTitle') : t('usersPage.actions.editDialogTitle')}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label={t('usersPage.form.userCode')}
            value={values.user_code}
            onChange={(event) => onChange('user_code', event.target.value)}
            fullWidth
            disabled={!isCreate}
          />
          <TextField
            label={t('usersPage.form.fullName')}
            value={values.full_name}
            onChange={(event) => onChange('full_name', event.target.value)}
            fullWidth
          />
          <TextField
            label={t('usersPage.form.email')}
            type="email"
            value={values.email}
            onChange={(event) => onChange('email', event.target.value)}
            fullWidth
          />
          <TextField
            label={t('usersPage.form.language')}
            value={values.language_use ?? ''}
            onChange={(event) => onChange('language_use', event.target.value)}
            fullWidth
          />
          <TextField
            label={t('usersPage.form.password')}
            type="password"
            value={values.password ?? ''}
            onChange={(event) => onChange('password', event.target.value)}
            fullWidth
            helperText={isCreate ? t('usersPage.form.passwordHelper') : undefined}
          />
          <FormControlLabel
            control={
              <Switch
                checked={values.is_active}
                onChange={(event) => onChange('is_active', event.target.checked)}
              />
            }
            label={t('usersPage.form.status')}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('button.cancel')}</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : t('usersPage.actions.saveButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type ToastState = {
  severity: 'success' | 'error';
  message: string;
} | null;

export const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const { data: users = [], isLoading } = useFetchUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);
  const [formState, setFormState] = useState<{
    open: boolean;
    mode: UserFormMode;
    values: UserFormValues;
  }>({ open: false, mode: 'create', values: defaultUserFormValues });
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [importDialog, setImportDialog] = useState<{ roleCode: string; roleLabel: string } | null>(null);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return users;
    }
    return users.filter((user) => {
      return (
        user.user_code.toLowerCase().includes(normalizedSearch) ||
        user.full_name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [users, searchTerm]);

  const sortedRows = useMemo(() => {
    if (!sortConfig) return filteredRows;
    const { field, direction } = sortConfig;
    const getValue = (user: AdminUser) => {
      switch (field) {
        case 'is_active':
          return user.is_active ? '1' : '0';
        case 'created_at':
        case 'updated_at':
          return user[field] ?? '';
        default:
          return String((user as Record<string, unknown>)[field] ?? '').toLowerCase();
      }
    };
    return [...filteredRows].sort((a, b) => {
      const aValue = getValue(a);
      const bValue = getValue(b);
      if (aValue === bValue) return 0;
      return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });
  }, [filteredRows, sortConfig]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, page, rowsPerPage]);

  const openCreateForm = useCallback(() => {
    setEditingUser(null);
    setFormState({ open: true, mode: 'create', values: defaultUserFormValues });
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
        language_use: user.language_use ?? '',
        is_active: user.is_active,
        password: '',
      },
    });
  }, []);

  const closeForm = () => {
    setFormState((prev) => ({ ...prev, open: false }));
  };

  const handleFormChange = (field: keyof UserFormValues, value: string | boolean) => {
    setFormState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [field]: value,
      },
    }));
  };

  const handleFormSubmit = () => {
    const payload: Record<string, unknown> = {
      user_code: formState.values.user_code,
      full_name: formState.values.full_name,
      email: formState.values.email,
      language_use: formState.values.language_use || undefined,
      is_active: formState.values.is_active,
    };

    if (formState.mode === 'create' && formState.values.password) {
      payload.password = formState.values.password;
    }

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
      language_use: payload.language_use,
      is_active: payload.is_active,
    };
    if (payload.password) {
      updatePayload.password = payload.password;
    }

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

  const handleDeleteUser = useCallback((user: AdminUser) => {
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
  }, [t, queryClient, deleteMutation]);

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
        field: 'language_use',
        headerName: t('usersPage.columns.language'),
        minWidth: 160,
        sortable: true,
      },
      {
        field: 'is_active',
        headerName: t('usersPage.columns.active'),
        minWidth: 140,
        sortable: true,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.value ? t('usersPage.status.active') : t('usersPage.status.inactive')}
            color={params.value ? 'success' : 'error'}
          />
        ),
      },
      {
        field: 'created_at',
        headerName: t('usersPage.columns.createdAt'),
        minWidth: 180,
        sortable: true,
        valueGetter: (params: { row: AdminUser }) => params.row.created_at,
      },
      {
        field: 'updated_at',
        headerName: t('usersPage.columns.updatedAt'),
        minWidth: 180,
        sortable: true,
        valueGetter: (params: { row: AdminUser }) => params.row.updated_at,
      },
      {
        field: 'actions',
        headerName: t('usersPage.columns.actions'),
        minWidth: 160,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
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
    [t, openEditForm, handleDeleteUser]
  );

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortConfig({ field, direction });
    setPage(0);
  };

  const openImportDialog = () => {
    setImportDialog({ roleCode: 'STUDENT', roleLabel: t('usersPage.importModal.title') });
  };

  const handleImportSuccess = (imported: number, skipped: number) => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    setToast({
      severity: 'success',
      message: t('usersPage.importModal.toast.success', { count: imported, skipped }),
    });
  };

  const handleImportError = (message: string) => {
    setToast({ severity: 'error', message });
  };

  // const pageCount = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5">{t('usersPage.title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('usersPage.actions.subtitle')}
          </Typography>
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

      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <TextField
          size="small"
          variant="outlined"
          placeholder={t('placeHolder.search')}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          InputProps={{
            endAdornment: (
              <Typography variant="caption" color="text.secondary">
                {users.length} {t('usersPage.actions.rows')}
              </Typography>
            ),
          }}
        />
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {t('usersPage.actions.filtered')}
          </Typography>
        </Stack>
      </Stack>

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
