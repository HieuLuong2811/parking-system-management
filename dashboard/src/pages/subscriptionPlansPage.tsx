import {
  Alert,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SoftDataGrid } from '../components/common/SoftDataGrid';
import { SubscriptionPlanModal, type SubscriptionPlanFormPayload } from '../components/modals/SubscriptionPlanModal';
import {
  useAdminSubscriptionPlans,
  useCreateSubscriptionPlan,
  useDeleteSubscriptionPlan,
  useUpdateSubscriptionPlan,
} from '../api/subscriptionPlans';
import type { SubscriptionPlanRecord } from '../api/types';
import { formatCurrency, formatDateTime } from '../ultis/format';
import FilterListIcon from '@mui/icons-material/FilterList';
import { planTypeOptions } from '../constant/config';

type ToastSeverity = 'success' | 'error';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const SubscriptionPlansPage: React.FC = () => {
  const planTypeFilterOptions = useMemo(
    () => ['ALL', ...Object.values(planTypeOptions)] as const,
    []
  );
  const [planTypeFilter, setPlanTypeFilter] = useState<(typeof planTypeFilterOptions)[number]>('ALL');
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
      { field: 'plans_type', headerName: t('subscriptionPlansPage.columns.planType', { defaultValue: 'Plan type' }), width: 240, sortable: true,
        renderCell: (params) => {
          const value = params.value;
          return t(`common.subscriptionPlans.${value}`, { defaultValue: value });
        },
      },
      {
        field: 'price_per_day',
        headerName: t('subscriptionPlansPage.columns.pricePerDay'),
        width: 160,
        sortable: true,
        renderCell: (params) => <span>{formatCurrency(params.value as number)}</span>,
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
          const disabled = Boolean(plan.is_in_use);
          return (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title={t('subscriptionPlansPage.tooltips.edit', { defaultValue: 'Edit plan' })}>
                <IconButton size="small" onClick={() => handleStartEdit(plan)} aria-label="edit">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={
                  disabled
                    ? t('subscriptionPlansPage.tooltips.locked', { defaultValue: 'Plan is in use' })
                    : t('subscriptionPlansPage.tooltips.delete', { defaultValue: 'Delete plan' })
                }
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleDeletePlan(plan)}
                    aria-label="delete"
                    disabled={disabled}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          );
        },
      },
    ];
  }, [handleDeletePlan, handleStartEdit, t]);

  const handleClearFilters = useCallback(() => {
    setPlanTypeFilter('ALL');
  }, []);
  const filteredPlans = useMemo(() => {
    if (planTypeFilter === 'ALL') return plans;
    return plans.filter((plan) => plan.plans_type === planTypeFilter);
  }, [planTypeFilter, plans]);
  const fetchErrorMessage = useMemo(() => {
    if (!isError) return '';
    if (error instanceof Error) return error.message;
    return String(error ?? '');
  }, [error, isError]);

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Stack spacing={0.5}>
          <Typography variant="h5">{t('subscriptionPlansPage.title', 'Subscription Plans')}</Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={2}>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <FilterListIcon color="action" />
              <Typography variant="body2">{t('common.filters.search')}</Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 280 }}>
              <InputLabel>
                {t('subscriptionPlansPage.columns.planType', { defaultValue: 'Plan type' })}
              </InputLabel>
              <Select
                value={planTypeFilter}
                label={t('subscriptionPlansPage.columns.planType', { defaultValue: 'Plan type' })}
                onChange={(event) =>
                  setPlanTypeFilter(event.target.value as (typeof planTypeFilterOptions)[number])
                }
              >
                {planTypeFilterOptions.map((value) => (
                  <MenuItem key={value} value={value}>
                    {t(`common.subscriptionPlans.${value}`, { defaultValue: value })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button onClick={handleClearFilters}>
              {t('common.filters.reset', { defaultValue: 'Reset filters' })}
            </Button>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" size="small" onClick={handleOpenNew}>
              {t('subscriptionPlansPage.button.add', { defaultValue: 'Add new plan' })}
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
            rows={filteredPlans}
            columns={columns}
            loading={isLoading}
            getRowId={(row) => (row as SubscriptionPlanRecord).id}
            emptyMessage={t('subscriptionPlansPage.empty', 'No plans defined yet.')}
          />
        </Paper>
      </Box>

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
