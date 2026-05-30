import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tooltip,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";

import { SoftDataGrid } from "../components/common/SoftDataGrid";
import { PageHeader } from "../components/common/PageHeader";
import type { PaymentPlanRecord } from "../api/types";
import {
  PaymentPlanModal,
  type PaymentPlanFormPayload,
} from "../components/modals/PaymentPlanModal";
import {
  useAdminPaymentPlans,
  useCreatePaymentPlan,
  useDeletePaymentPlan,
  useUpdatePaymentPlan,
} from "../api/paymentPlans";
import { formatDateTime } from "../ultis/format";
import { getApiErrorMessage } from "../helper/messageError";

type ToastSeverity = "success" | "error";

export const PaymentPlansPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    data: plans = [],
    isLoading,
    isError,
    error,
  } = useAdminPaymentPlans();
  const { mutateAsync: createAsync } = useCreatePaymentPlan();
  const { mutateAsync: updateAsync } = useUpdatePaymentPlan();
  const { mutateAsync: deleteAsync } = useDeletePaymentPlan();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentPlanRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    severity: ToastSeverity;
    message: string;
  } | null>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (plan: PaymentPlanRecord) => {
    setEditing(plan);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const onSubmit = useCallback(
    async (payload: PaymentPlanFormPayload) => {
      setSaving(true);
      try {
        const cleanedPayload = {
          ...payload,
          discount_percent: payload.discount_percent ?? undefined,
        };
        if (editing) {
          await updateAsync({ id: editing.id, payload: cleanedPayload });
          setToast({
            severity: "success",
            message: t("paymentPlansPage.toast.updated", {
              defaultValue: "Updated payment plan.",
            }),
          });
        } else {
          await createAsync(cleanedPayload);
          setToast({
            severity: "success",
            message: t("paymentPlansPage.toast.created", {
              defaultValue: "Created payment plan.",
            }),
          });
        }
        closeModal();
      } catch (err) {
         setToast({
          severity: 'error',
          message: getApiErrorMessage(
            err,
            t,
            'paymentPlansPage.toast',
            t('paymentPlansPage.toast.saveError', {
              defaultValue: 'Unable to save payment plan.',
            })
          ),
        });
      } finally {
        setSaving(false);
      }
    },
    [createAsync, editing, t, updateAsync],
  );

  const onDelete = useCallback(
    async (plan: PaymentPlanRecord) => {
      const confirmed = window.confirm(
        t("paymentPlansPage.toast.deleteConfirm", {
          defaultValue: "Delete this payment plan?",
        }),
      );
      if (!confirmed) return;
      try {
        await deleteAsync(plan.id);
        setToast({
          severity: "success",
          message: t("paymentPlansPage.toast.deleted", {
            defaultValue: "Deleted payment plan.",
          }),
        });
      } catch (err) {
        setToast({
          severity: "error",
          message: getApiErrorMessage(
            err,
            t,
            "paymentPlansPage.toast",
            t("paymentPlansPage.toast.deleteError", {
              defaultValue: "Unable to delete payment plan.",
            }),
          ),
        });
      }
    },
    [deleteAsync, t],
  );

  const columns = useMemo<GridColDef<PaymentPlanRecord>[]>(() => {
    return [
      {
        field: "payment_type",
        headerName: t("paymentPlansPage.columns.paymentType", {
          defaultValue: "Payment type",
        }),
        width: 160,
        sortable: true,
        renderCell: (params) =>
          t(`common.paymentPlan.${params.value}`, {
            defaultValue: params.value,
          }),
      },
      {
        field: "discount_percent",
        headerName: t("paymentPlansPage.columns.discountPercent", {
          defaultValue: "Discount (%)",
        }),
        width: 140,
        sortable: true,
        renderCell: (params) => (
          <span>{params.value == null ? "-" : String(params.value)}</span>
        ),
      },
      {
        field: "is_active",
        headerName: t("paymentPlansPage.columns.active", {
          defaultValue: "Active",
        }),
        width: 120,
        sortable: true,
        renderCell: (params) => (
          <Chip
            size="small"
            label={
              params.value
                ? t("paymentPlansPage.status.active", {
                    defaultValue: "Active",
                  })
                : t("paymentPlansPage.status.inactive", {
                    defaultValue: "Inactive",
                  })
            }
            color={params.value ? "success" : "default"}
          />
        ),
      },
      {
        field: "created_at",
        headerName: t("paymentPlansPage.columns.createdAt", {
          defaultValue: "Created at",
        }),
        width: 200,
        sortable: true,
        renderCell: (params) => formatDateTime(params.row.created_at),
      },
      {
        field: "updated_at",
        headerName: t("paymentPlansPage.columns.updatedAt", {
          defaultValue: "Updated at",
        }),
        width: 200,
        sortable: true,
        renderCell: (params) => formatDateTime(params.row.updated_at),
      },
      {
        field: "actions",
        headerName: t("paymentPlansPage.columns.actions", {
          defaultValue: "Actions",
        }),
        width: 120,
        sortable: false,
        renderCell: (params) => (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip
              title={t("paymentPlansPage.tooltips.edit", {
                defaultValue: "Edit",
              })}
            >
              <IconButton size="small" onClick={() => openEdit(params.row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {params.row.is_in_use ? (
              <Tooltip
                title={t("paymentPlansPage.tooltips.inUse", {
                  defaultValue: "Payment plan is in use",
                })}
              >
                <span>
                  <IconButton size="small" disabled>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              <Tooltip
                title={t("paymentPlansPage.tooltips.delete", {
                  defaultValue: "Delete",
                })}
              >
                <IconButton size="small" onClick={() => onDelete(params.row)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ];
  }, [onDelete, t]);

  const fetchErrorMessage = useMemo(() => {
    if (!isError) return "";
    if (error instanceof Error) return error.message;
    return String(error ?? "");
  }, [error, isError]);

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <PageHeader
          title={t("paymentPlansPage.title")}
          subtitle={t("paymentPlansPage.description")}
        />

        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button variant="contained" onClick={openCreate}>
            {t("paymentPlansPage.button.add")}
          </Button>
        </Stack>

        {fetchErrorMessage ? (
          <Alert severity="error" variant="filled">
            {fetchErrorMessage}
          </Alert>
        ) : null}

        <Paper elevation={0}>
          <SoftDataGrid
            rows={plans}
            columns={columns}
            loading={isLoading}
            getRowId={(row) => (row as PaymentPlanRecord).id}
            maxHeight={520}
            emptyMessage={t("paymentPlansPage.empty")}
          />
        </Paper>
      </Box>

      <PaymentPlanModal
        key={`${editing?.id ?? "new"}-${modalOpen ? "open" : "closed"}`}
        open={modalOpen}
        onClose={closeModal}
        onSubmit={onSubmit}
        initialValue={editing}
        submitting={saving}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {toast ? (
          <Alert
            onClose={() => setToast(null)}
            severity={toast.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
};
