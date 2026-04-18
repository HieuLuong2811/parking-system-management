import { Alert, Box, Button, IconButton, Snackbar, Tooltip } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AcademicTermModal, type AcademicTermFormPayload } from '../components/modals/AcademicTermModal';
import { ResourceTableLayout } from '../components/resource/resourceTableLayout';
import {
  useAdminAcademicTerms,
  useCreateAcademicTerm,
  useDeleteAcademicTerm,
  useUpdateAcademicTerm,
} from '../api/terms';
import type { AcademicTermRecord } from '../api/types';
import { formatDateTime } from '../ultis/format';

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

  const { data: terms = [], isLoading, isError, error } = useAdminAcademicTerms();

  const { mutateAsync: createTermAsync } = useCreateAcademicTerm();
  const { mutateAsync: updateTermAsync } = useUpdateAcademicTerm();
  const { mutateAsync: deleteTermAsync } = useDeleteAcademicTerm();

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

  const handleDeleteTerm = useCallback(
    async (term: AcademicTermRecord) => {
      const confirmed = window.confirm('Are you sure you want to delete this academic term?');
      if (!confirmed) {
        return;
      }
      try {
        await deleteTermAsync(term.id);
        setToast({ severity: 'success', message: 'Academic term deleted.' });
      } catch (deleteError) {
        setToast({
          severity: 'error',
          message: getErrorMessage(deleteError, 'Unable to delete academic term.'),
        });
      }
    },
    [deleteTermAsync]
  );

  const columns = useMemo<GridColDef<AcademicTermRecord>[]>(() => {
    const baseColumns: GridColDef<AcademicTermRecord>[] = [
      { field: 'id', headerName: 'Term ID', width: 220, sortable: true },
      { field: 'term_name', headerName: 'Term name', width: 260, sortable: true },
      { field: 'start_date', headerName: 'Start', width: 180, sortable: true },
      { field: 'end_date', headerName: 'End', width: 180, sortable: true },
      {
        field: 'created_at',
        headerName: 'Created at',
        width: 220,
        sortable: true,
        renderCell: (params) => formatDateTime(params.value),
      }
    ];
    return [
      ...baseColumns,
      {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        width: 150,
        renderCell: (params) => {
          const term = params.row as AcademicTermRecord;
          return (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Edit term">
                <IconButton size="small" onClick={() => handleStartEdit(term)} aria-label="edit">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {/* <Tooltip title={disabled ? 'Term is in use' : 'Delete term'}> */}
                <span>
                  <IconButton size="small" onClick={() => handleDeleteTerm(term)} aria-label="delete">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              {/* </Tooltip> */}
            </Box>
          );
        },
      },
    ];
  }, [handleDeleteTerm, handleStartEdit]);

  const searchKeys = useMemo(
    () => (row: AcademicTermRecord) => [row.id, row.term_name, row.start_date, row.end_date],
    []
  );
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
  }, []);

  const filterControls = (
    <Button variant="contained" size="small" onClick={handleOpenNew} startIcon={<AddIcon />}>
      Add term
    </Button>
  );

  return (
    <>
      <ResourceTableLayout
        title="Quản lý học kỳ"
        description="Định nghĩa kỳ học và thời gian áp dụng."
        columns={columns}
        rows={terms}
        loading={isLoading}
        error={isError ? error : undefined}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by term or id"
        searchKeys={searchKeys}
        emptyMessage="No academic terms registered."
        filterControls={filterControls}
        onClearFilters={handleClearFilters}
        clearLabel={t('button.clear', { defaultValue: 'Clear' })}
        getRowId={(row) => row.id}
      />

      <AcademicTermModal
        key={`${editingTerm?.id ?? 'new'}-${modalOpen ? 'open' : 'closed'}`}
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTerm}
        initialValue={editingTerm}
        submitting={isSaving}
        // disableDates={Boolean(editingTerm && isTermUsed(editingTerm.id))}
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
