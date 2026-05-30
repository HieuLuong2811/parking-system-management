import { Alert, Box, Button, IconButton, Paper, Snackbar, Stack, TextField, Tooltip, Typography } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FilterListIcon from '@mui/icons-material/FilterList';
import { AcademicTermModal, type AcademicTermFormPayload } from '../components/modals/AcademicTermModal';
import { SoftDataGrid } from '../components/common/SoftDataGrid';
import {
  useAdminAcademicTerms,
  useCreateAcademicTerm,
  useDeleteAcademicTerm,
  useUpdateAcademicTerm,
} from '../api/terms';
import type { AcademicTermRecord } from '../api/types';
import { formatDateTime } from '../ultis/format';
import { PageHeader } from '../components/common/PageHeader';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

type ToastSeverity = 'success' | 'error';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const TermsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<AcademicTermRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: ToastSeverity } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedDeleteTerm, setSelectedDeleteTerm] = useState<AcademicTermRecord | null>(null);
  const { data: terms = [], isLoading, isError, error } = useAdminAcademicTerms();

  const { mutateAsync: createTermAsync } = useCreateAcademicTerm();
  const { mutateAsync: updateTermAsync } = useUpdateAcademicTerm();
  const { mutateAsync: deleteTermAsync, isPending: isDeleting } = useDeleteAcademicTerm();

  const handleOpenNew = useCallback(() => {
    setEditingTerm(null);
    setModalOpen(true);
  }, []);

  const handleStartEdit = useCallback((term: AcademicTermRecord) => {
    setEditingTerm(term);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingTerm(null);
  }, []);

  const handleSubmitTerm = useCallback(
    async (payload: AcademicTermFormPayload) => {
      setIsSaving(true);
      try {
        if (editingTerm) {
          await updateTermAsync({ id: editingTerm.id, payload });
          setToast({ severity: 'success', message: 'Academic term updated.' });
        } else {
          await createTermAsync(payload);
          setToast({ severity: 'success', message: 'Academic term created.' });
        }
        handleCloseModal();
      } catch (submissionError) {
        setToast({
          severity: 'error',
          message: getErrorMessage(submissionError, 'Unable to save academic term.'),
        });
      } finally {
        setIsSaving(false);
      }
    },
    [createTermAsync, editingTerm, handleCloseModal, updateTermAsync]
  );

  const handleDeleteTerm = useCallback((term: AcademicTermRecord) => {
    setSelectedDeleteTerm(term);
    setDeleteConfirmOpen(true);
  }, []);

  const handleCloseDeleteConfirm = useCallback(() => {
    setDeleteConfirmOpen(false);
    setSelectedDeleteTerm(null);
  }, []);

  const handleConfirmDeleteTerm = useCallback(async () => {
    if (!selectedDeleteTerm) return;

    try {
      await deleteTermAsync(selectedDeleteTerm.id);

      setToast({
        severity: "success",
        message: t("termsPage.delete.success"),
      });

      handleCloseDeleteConfirm();
    } catch (deleteError) {
      setToast({
        severity: "error",
        message: getErrorMessage(deleteError, t("termsPage.delete.error")),
      });
    }
  }, [selectedDeleteTerm, deleteTermAsync, handleCloseDeleteConfirm, t]);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'term_name', headerName: t('termsPage.fields.termName'), width: 260, sortable: true },
      { field: 'start_date', headerName: t('termsPage.fields.startDate'), width: 180, sortable: true },
      { field: 'end_date', headerName: t('termsPage.fields.endDate'), width: 180, sortable: true },
      {
        field: 'created_at',
        headerName: t('termsPage.fields.createdAt'),
        width: 220,
        sortable: true,
        renderCell: (params) => formatDateTime(params.value),
      },
      {
        field: 'actions',
        headerName: t('termsPage.fields.actions'),
        sortable: false,
        width: 150,
        renderCell: (params) => {
          const term = params.row as AcademicTermRecord;
          return (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title={t('termsPage.tooltips.edit')}>
                <IconButton size="small" onClick={() => handleStartEdit(term)} aria-label="edit">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('termsPage.tooltips.delete')}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteTerm(term)}
                    aria-label="delete"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          );
        },
      },
    ], [handleDeleteTerm, handleStartEdit, t]
  );

  const searchKeys = useMemo(
    () => (row: AcademicTermRecord) => [row.id, row.term_name, row.start_date, row.end_date],
    []
  );
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
  }, []);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredTerms = useMemo(() => {
    if (!normalizedSearch) return terms;
    return terms.filter((term) =>
      searchKeys(term).some((value) => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(normalizedSearch);
      })
    );
  }, [normalizedSearch, searchKeys, terms]);
  const fetchErrorMessage = useMemo(() => {
    if (!isError) return '';
    if (error instanceof Error) return error.message;
    return String(error ?? '');
  }, [error, isError]);

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <PageHeader
          title={t('termsPage.title', 'Academic Terms')}
          subtitle={t('termsPage.description', 'Define academic terms and their application periods.')}
        />

        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <FilterListIcon color="action" />
              <Typography variant="body2">{t('common.filters.search')}</Typography>
            </Box>
            <TextField
              size="small"
              variant="outlined"
              value={searchTerm}
              label={t('termsPage.searchTerm.name', { defaultValue: 'Search by term name' })}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <Button variant="text" onClick={handleClearFilters}>
              {t('common.filters.reset')}
            </Button>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={handleOpenNew}>
              {t('termsPage.buttons.add', { defaultValue: 'Add new term' })}
            </Button>
          </Stack>
        </Stack>

        {fetchErrorMessage && (
          <Alert severity="error" variant="filled">
            {fetchErrorMessage}
          </Alert>
        )}

        <Paper elevation={0}>
          <SoftDataGrid
            rows={filteredTerms}
            columns={columns}
            loading={isLoading}
            getRowId={(row) => (row as AcademicTermRecord).id}
            emptyMessage={t('termsPage.empty', { defaultValue: 'No academic terms registered.' })}
          />
        </Paper>
      </Box>

      <AcademicTermModal
        key={`${editingTerm?.id ?? 'new'}-${modalOpen ? 'open' : 'closed'}`}
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTerm}
        initialValue={editingTerm}
        submitting={isSaving}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t("termsPage.delete.title")}
        content={t("termsPage.delete.message", {
          name: selectedDeleteTerm?.term_name ?? "",
        })}
        confirmText={t("termsPage.delete.confirm")}
        cancelText={t("termsPage.delete.cancel")}
        loading={isDeleting}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDeleteTerm}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={toast?.severity ?? 'success'} onClose={() => setToast(null)} variant="filled">
          {toast?.message}
        </Alert>
      </Snackbar>
    </>
  );
};
