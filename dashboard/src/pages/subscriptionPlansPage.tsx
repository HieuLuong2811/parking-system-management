import { Alert, Box, Button, IconButton, Snackbar, Tooltip } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceTableLayout } from '../components/resource/resourceTableLayout';
import { SubscriptionPlanModal, type SubscriptionPlanFormPayload } from '../components/modals/SubscriptionPlanModal';
import {
  useAdminSubscriptionPlans,
  useCreateSubscriptionPlan,
  useDeleteSubscriptionPlan,
  useUpdateSubscriptionPlan,
} from '../api/subscriptionPlans';
import type { SubscriptionPlanRecord } from '../api/types';
import { formatCurrency, formatDateTime } from '../ultis/format';

type ToastSeverity = 'success' | 'error';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const SubscriptionPlansPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: ToastSeverity } | null>(null);
  const { t } = useTranslation();

  const { data: plans = [], isLoading, isError, error } = useAdminSubscriptionPlans();

  const { mutateAsync: createPlanAsync } = useCreateSubscriptionPlan();
  const { mutateAsync: updatePlanAsync } = useUpdateSubscriptionPlan();
  const { mutateAsync: deletePlanAsync } = useDeleteSubscriptionPlan();

  const handleOpenNew = useCallback(() => {
    setEditingPlan(null);
    setModalOpen(true);
  }, []);

  const handleStartEdit = useCallback((plan: SubscriptionPlanRecord) => {
    setEditingPlan(plan);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingPlan(null);
  }, []);

  const handleSubmitPlan = useCallback(
    async (payload: SubscriptionPlanFormPayload) => {
      setIsSaving(true);
      try {
        if (editingPlan) {
          await updatePlanAsync({ id: editingPlan.id, payload });
          setToast({ severity: 'success', message: t('subscriptionPlansPage.toast.updated') });
        } else {
          await createPlanAsync(payload);
          setToast({ severity: 'success', message: t('subscriptionPlansPage.toast.created') });
        }
        handleCloseModal();
      } catch (submissionError) {
        setToast({
          severity: 'error',
          message: getErrorMessage(submissionError, t('subscriptionPlansPage.toast.saveError')),
        });
      } finally {
        setIsSaving(false);
      }
    },
    [createPlanAsync, editingPlan, handleCloseModal, updatePlanAsync, t]
  );

  const handleDeletePlan = useCallback(
    async (plan: SubscriptionPlanRecord) => {
      const confirmed = window.confirm(t('subscriptionPlansPage.toast.deleteConfirm'));
      if (!confirmed) {
        return;
      }
      try {
        await deletePlanAsync(plan.id);
        setToast({ severity: 'success', message: t('subscriptionPlansPage.toast.deleted') });
      } catch (deleteError) {
        setToast({
          severity: 'error',
          message: getErrorMessage(deleteError, t('subscriptionPlansPage.toast.deleteError')),
        });
      }
    },
    [deletePlanAsync, t]
  );

  const columns = useMemo<GridColDef<SubscriptionPlanRecord>[]>(() => {
    const baseColumns: GridColDef<SubscriptionPlanRecord>[] = [
      { field: 'plan_name', headerName: t('subscriptionPlansPage.columns.planName'), width: 240, sortable: true },
      {
        field: 'price_per_day',
        headerName: t('subscriptionPlansPage.columns.pricePerDay'),
        width: 160,
        sortable: true,
        renderCell: (params) => <span>{formatCurrency(params.value as number)}</span>,
      },
      {
        field: 'description',
        headerName: t('subscriptionPlansPage.columns.description'),
        flex: 1,
        sortable: false,
        renderCell: (params) => <span>{params.value ?? '-'}</span>,
      },
      {
        field: 'updated_at',
        headerName: t('subscriptionPlansPage.columns.updatedAt'),
        width: 200,
        sortable: true,
        renderCell: (params) => formatDateTime(params.row.updated_at),
      },
    ];
    return [
      ...baseColumns,
      {
        field: 'actions',
        headerName: t('subscriptionPlansPage.columns.actions'),
        sortable: false,
        width: 150,
        renderCell: (params) => {
          const plan = params.row as SubscriptionPlanRecord;
          return (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title={t('subscriptionPlansPage.tooltips.edit')}>
                <IconButton size="small" onClick={() => handleStartEdit(plan)} aria-label="edit">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {/* <Tooltip title={disabled ? t('subscriptionPlansPage.tooltips.locked') : t('subscriptionPlansPage.tooltips.delete')}> */}
                <span>
                  <IconButton size="small" onClick={() => handleDeletePlan(plan)} aria-label="delete">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              {/* </Tooltip> */}
            </Box>
          );
        },
      },
    ];
  }, [handleDeletePlan, handleStartEdit, t]);

  const searchKeys = useMemo(
    () => (row: SubscriptionPlanRecord) => [row.id, row.plan_name],
    []
  );
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
  }, []);

  const filterControls = (
    <Button variant="contained" size="small" onClick={handleOpenNew} startIcon={<AddIcon />}>
      Add plan
    </Button>
  );

  return (
    <>
      <ResourceTableLayout
        title="Subscription plans"
        description="Danh sách gói đăng ký hiện có."
        columns={columns}
        rows={plans}
        loading={isLoading}
        error={isError ? error : undefined}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by plan name or id"
        searchKeys={searchKeys}
        emptyMessage="No plans defined yet."
        filterControls={filterControls}
        onClearFilters={handleClearFilters}
        clearLabel={t('button.clear', { defaultValue: 'Clear' })}
        getRowId={(row) => row.id}
      />

      <SubscriptionPlanModal
        key={`${editingPlan?.id ?? 'new'}-${modalOpen ? 'open' : 'closed'}`}
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitPlan}
        initialValue={editingPlan}
        submitting={isSaving}
        // disablePriceField={Boolean(editingPlan && isPlanUsed(editingPlan.id))}
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
