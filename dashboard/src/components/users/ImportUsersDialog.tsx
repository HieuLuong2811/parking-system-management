import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
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
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import FilterListIcon from '@mui/icons-material/FilterList';
import { importUsers } from '../../api/resources';

type FilterStatus = 'all' | 'valid' | 'invalid';
type ImportRowError = 'missingUserCode' | 'missingEmail' | 'invalidEmail';

type ParsedUserEntry = {
  source_index: number;
  user_code: string;
  full_name: string;
  email: string;
  phone_number: string;
  errors: ImportRowError[];
  isValid: boolean;
};

const normalizeValue = (value: unknown) =>
  typeof value === 'string' ? value.trim() : String(value ?? '').trim();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEntry = (entry: Omit<ParsedUserEntry, 'errors' | 'isValid'>): ParsedUserEntry => {
  const userCode = entry.user_code.trim();
  const email = entry.email.trim();

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
    ...entry,
    user_code: userCode,
    email,
    errors,
    isValid: errors.length === 0,
  };
};

const parseExcelFile = async (file: File): Promise<ParsedUserEntry[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' });

  return rows.map((row, index) => {
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
    const phone_number =
      normalizeValue(row.phone_number) ||
      normalizeValue(row['Phone number']) ||
      normalizeValue(row['phone number']) ||
      normalizeValue(row['Số điện thoại']) ||
      '';

    return validateEntry({
      source_index: index,
      user_code: userCode,
      full_name: fullName || userCode,
      email,
      phone_number,
    });
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

export const ImportUsersDialog: React.FC<ImportUsersDialogProps> = ({
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
  const [searchUserCode, setSearchUserCode] = useState('');
  const [searchNameEmail, setSearchNameEmail] = useState('');
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
      setSearchUserCode('');
      setSearchNameEmail('');
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
    const codeSearch = searchUserCode.trim().toLowerCase();
    const nameEmailSearch = searchNameEmail.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'valid' && row.isValid) ||
        (statusFilter === 'invalid' && !row.isValid);
      if (!matchesStatus) {
        return false;
      }
      if (codeSearch && !row.user_code.toLowerCase().includes(codeSearch)) {
        return false;
      }
      if (nameEmailSearch) {
        const matchesName = row.full_name.toLowerCase().includes(nameEmailSearch);
        const matchesEmail = row.email.toLowerCase().includes(nameEmailSearch);
        if (!matchesName && !matchesEmail) {
          return false;
        }
      }
      return true;
    });
  }, [rows, searchNameEmail, searchUserCode, statusFilter]);

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

  const handleCellChange = (
    source_index: number,
    field: 'user_code' | 'full_name' | 'email' | 'phone_number',
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.source_index !== source_index) return row;
        return validateEntry({
          source_index: row.source_index,
          user_code: field === 'user_code' ? value : row.user_code,
          full_name: field === 'full_name' ? value : row.full_name,
          email: field === 'email' ? value : row.email,
          phone_number: field === 'phone_number' ? value : row.phone_number,
        });
      }),
    );
  };

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
          full_name: row.full_name || row.user_code,
          email: row.email,
          phone_number: row.phone_number || undefined,
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
    <Dialog open={open} fullWidth maxWidth="lg">
      <DialogTitle>{t('usersPage.importModal.title', { role: roleLabel })}</DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Snackbar open={Boolean(loadError)} autoHideDuration={6000} onClose={() => setLoadError('')} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Alert severity="error" variant="outlined">
            {loadError}
          </Alert>
        </Snackbar>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <FilterListIcon color="action" />
              <Typography variant="body2">{t('common.filters.search')}</Typography>
            </Box>
            <TextField
              label={t('usersPage.importModal.filters.userCode')}
              value={searchUserCode}
              onChange={(event) => {
                setSearchUserCode(event.target.value);
                setPage(0);
              }}
              size="small"
              variant="outlined"
              sx={{ minWidth: 180 }}
            />
            <TextField
              label={t('usersPage.importModal.filters.nameOrEmail')}
              value={searchNameEmail}
              onChange={(event) => {
                setSearchNameEmail(event.target.value);
                setPage(0);
              }}
              size="small"
              variant="outlined"
              sx={{ minWidth: 220 }}
            />
            <FormControl size="small">
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
          </Box>

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
            <Table stickyHeader size="small" sx={{ borderCollapse: 'collapse'}}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('usersPage.importModal.tableHeaders.userCode')}</TableCell>
                  <TableCell>{t('usersPage.importModal.tableHeaders.fullName')}</TableCell>
                  <TableCell>{t('usersPage.importModal.tableHeaders.email')}</TableCell>
                  <TableCell>{t('usersPage.importModal.tableHeaders.phoneNumber')}</TableCell>
                  <TableCell>{t('usersPage.importModal.tableHeaders.status')}</TableCell>
                  <TableCell>{t('usersPage.importModal.tableHeaders.errors')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        {t('usersPage.importModal.noRows')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row) => (
                    <TableRow key={row.source_index} hover>
                      <TableCell sx={{ py: 0.5 }}>
                        <TextField
                          value={row.user_code}
                          onChange={(event) =>
                            handleCellChange(row.source_index, 'user_code', event.target.value)
                          }
                          size="small"
                          fullWidth
                          disabled={isImporting}
                          error={row.errors.includes('missingUserCode')}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <TextField
                          value={row.full_name}
                          onChange={(event) =>
                            handleCellChange(row.source_index, 'full_name', event.target.value)
                          }
                          size="small"
                          fullWidth
                          disabled={isImporting}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <TextField
                          value={row.email}
                          onChange={(event) => handleCellChange(row.source_index, 'email', event.target.value)}
                          size="small"
                          fullWidth
                          disabled={isImporting}
                          error={row.errors.includes('missingEmail') || row.errors.includes('invalidEmail')}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <TextField
                          value={row.phone_number}
                          onChange={(event) =>
                            handleCellChange(row.source_index, 'phone_number', event.target.value)
                          }
                          size="small"
                          fullWidth
                          disabled={isImporting}
                        />
                      </TableCell>
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
