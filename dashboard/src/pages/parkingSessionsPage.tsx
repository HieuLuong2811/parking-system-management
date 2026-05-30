import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { SoftDataGrid } from "../components/common/SoftDataGrid";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { ParkingSessionAdminRow, TimePreset } from "../api/types";
import { formatCurrency, formatDateTime } from "../ultis/format";
import { useParkingSessionsPaginated } from "../api/parkingSessions";
import FilterListIcon from "@mui/icons-material/FilterList";
import { userTypes } from "../constant/config";
import { PageHeader } from "../components/common/PageHeader";
import { TimeRangePopoverFilter } from "../components/common/TimeRangePopoverFilter";
import { UserIdentityCell } from "../components/common/UserIdentityCell";
import Tooltip from "@mui/material/Tooltip";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { PlateImagesDialog } from "../components/parkingSessions/PlateImagesDialog";

type ParkingSessionsFiltersState = {
  userCode: string;
  status: string;
};

type ParkingSessionsTimeState = {
  preset: TimePreset;
  from: string;
  to: string;
};

export const ParkingSessionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ParkingSessionsFiltersState>({
    userCode: "",
    status: "ACTIVE",
  });
  const [time, setTime] = useState<ParkingSessionsTimeState>({
    preset: "CUSTOM",
    from: "",
    to: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const updateFilters = (
    updater: (prev: ParkingSessionsFiltersState) => ParkingSessionsFiltersState,
  ) => {
    setFilters((prev) => updater(prev));
    setPage(0);
  };

  const [selectedPlateImages, setSelectedPlateImages] = useState<{
    checkInImageUrl?: string | null;
    checkOutImageUrl?: string | null;
  } | null>(null);

  const updateTime = (
    updater: (prev: ParkingSessionsTimeState) => ParkingSessionsTimeState,
  ) => {
    setTime((prev) => updater(prev));
    setPage(0);
  };

  const debouncedFields = useDebouncedValue(
    {
      userCode: filters.userCode,
      status: filters.status,
      from: time.from,
      to: time.to,
    },
    400,
  );

  const formatDateOnly = useCallback((value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }, []);

  const dateToFromTime = (dateValue: string) => `${dateValue}T00:00:00`;
  const dateToToTime = (dateValue: string) => `${dateValue}T23:59:59`;

  const queryFilters = useMemo(
    () => ({
      page: page + 1,
      limit: rowsPerPage,
      user_code: debouncedFields.userCode.trim() || undefined,
      status: (debouncedFields.status || undefined) as
        | "ACTIVE"
        | "DONE"
        | undefined,
      from_time: debouncedFields.from
        ? dateToFromTime(debouncedFields.from)
        : undefined,
      to_time: debouncedFields.to
        ? dateToToTime(debouncedFields.to)
        : undefined,
    }),
    [debouncedFields, page, rowsPerPage],
  );

  const {
    data: paginated,
    isLoading,
    isError,
  } = useParkingSessionsPaginated(queryFilters);
  const rows = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;

  const columns = useMemo<GridColDef<ParkingSessionAdminRow>[]>(() => {
    return [
      {
        field: "user_code",
        headerName: t("parkingSessionsPage.tableHeaders.user", {
          defaultValue: "User",
        }),
        minWidth: 220,
        flex: 1,
        sortable: false,
        renderCell: (params) => {
          const userType = String(params.row.user_type || "").toUpperCase();
          const isGuess = userType === userTypes.GUEST || !params.row.user_code;

          if (isGuess) {
            return (
              <Stack spacing={0.25}>
                <Typography variant="subtitle2">
                  {t("parkingSessionsPage.guest", { defaultValue: "GUEST" })}
                </Typography>
              </Stack>
            );
          }

          return (
            <UserIdentityCell
              fullName={params.row.user_full_name}
              userCode={String(params.row.user_code ?? "")}
            />
          );
        },
      },
      {
        field: "vehicle_mode",
        headerName: t("parkingSessionsPage.tableHeaders.vehicleId", {
          defaultValue: "Phương tiện",
        }),
        minWidth: 210,
        flex: 0.9,
        sortable: false,
        renderCell: (params) => {
          const vehicleMode = String(
            params.row.vehicle_mode || "",
          ).toUpperCase();
          const licensePlate = params.row.license_plate;

          const vehicleTypeLabel = t(
            `common.vehicleTypeOptions.${vehicleMode}`,
            {
              defaultValue:
                vehicleMode === "LICENSED"
                  ? "Xe có biển số"
                  : "Xe không biển số",
            },
          );

          return (
            <Stack spacing={0.25}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {vehicleTypeLabel}
              </Typography>

              {vehicleMode === "LICENSED" && (
                <Typography variant="caption" color="text.secondary">
                  {t("common.licensePlateLabel", {
                    license: licensePlate || "-",
                    defaultValue: `BKS: ${licensePlate || "-"}`,
                  })}
                </Typography>
              )}
            </Stack>
          );
        },
      },
      {
        field: "check_in_time",
        headerName: t("parkingSessionsPage.tableHeaders.checkIn", {
          defaultValue: "Check-in",
        }),
        minWidth: 180,
        renderCell: (p) => <span>{formatDateTime(p.value)}</span>,
      },
      {
        field: "check_out_time",
        headerName: t("parkingSessionsPage.tableHeaders.checkOut", {
          defaultValue: "Check-out",
        }),
        minWidth: 180,
        renderCell: (p) => <span>{formatDateTime(p.value)}</span>,
      },
      {
        field: "status",
        headerName: t("parkingSessionsPage.tableHeaders.status", {
          defaultValue: "Status",
        }),
        minWidth: 120,
        renderCell: (params) => (
          <Chip
            size="small"
            label={t(`parkingSessionsPage.status.${params.row.status}`, {
              defaultValue: params.row.status,
            })}
            color={params.row.status === "ACTIVE" ? "success" : "default"}
          />
        ),
      },
      {
        field: "total_amount",
        headerName: t("parkingSessionsPage.tableHeaders.amount", {
          defaultValue: "Amount",
        }),
        minWidth: 140,
        sortable: false,
        renderCell: (params) => (
          <span>{formatCurrency(params.row.total_amount)}</span>
        ),
      },
      {
        field: "actions",
        headerName: t("parkingSessionsPage.tableHeaders.actions", {
          defaultValue: "Thao tác",
        }),
        minWidth: 100,
        align: "center",
        headerAlign: "center",
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const hasAnyPlateImage =
            Boolean(params.row.check_in_plate_image_url) ||
            Boolean(params.row.check_out_plate_image_url);

          return (
            <Tooltip
              title={
                hasAnyPlateImage
                  ? t("parkingSessionsPage.actions.viewPlateImages", {
                      defaultValue: "Xem ảnh biển số",
                    })
                  : t("parkingSessionsPage.plateImages.noImage", {
                      defaultValue: "Không có ảnh biển số",
                    })
              }
            >
              <span>
                <IconButton
                  size="small"
                  disabled={!hasAnyPlateImage}
                  onClick={() => {
                    setSelectedPlateImages({
                      checkInImageUrl: params.row.check_in_plate_image_url,
                      checkOutImageUrl: params.row.check_out_plate_image_url,
                    });
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          );
        },
      },
    ];
  }, [t]);

  const handleClearFilters = () => {
    setFilters({ userCode: "", status: "" });
    setTime({ preset: "CUSTOM", from: "", to: "" });
    setPage(0);
  };
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <PageHeader
        title={t("parkingSessionsPage.title")}
        subtitle={t("parkingSessionsPage.description")}
      />

      <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <FilterListIcon color="action" />
          <Typography variant="body2">{t("common.filters.search")}</Typography>
        </Box>
        <TextField
          size="small"
          label={t("parkingSessionsPage.search.userCode")}
          value={filters.userCode}
          onChange={(e) => {
            updateFilters((prev) => ({ ...prev, userCode: e.target.value }));
          }}
        />
        <TextField
          select
          size="small"
          label={t("parkingSessionsPage.search.status", {
            defaultValue: "Status",
          })}
          value={filters.status}
          onChange={(e) => {
            updateFilters((prev) => ({ ...prev, status: e.target.value }));
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">
            {t("parkingSessionsPage.search.statusOptions.all", {
              defaultValue: "All",
            })}
          </MenuItem>
          <MenuItem value="ACTIVE">
            {t("parkingSessionsPage.search.statusOptions.active", {
              defaultValue: "Active",
            })}
          </MenuItem>
          <MenuItem value="DONE">
            {t("parkingSessionsPage.search.statusOptions.done", {
              defaultValue: "Done",
            })}
          </MenuItem>
        </TextField>

        <TimeRangePopoverFilter
          value={{
            preset: time.preset as
              | "CUSTOM"
              | "TODAY"
              | "YESTERDAY"
              | "LAST_7_DAYS",
            from: time.from,
            to: time.to,
          }}
          onChange={(next) => {
            updateTime(() => ({
              preset: next.preset as TimePreset,
              from: next.from,
              to: next.to,
            }));
          }}
          labels={{
            triggerLabel: t("parkingSessionsPage.search.timeRange", {
              defaultValue: "Search time range",
            }),
            presetLabel: t("parkingSessionsPage.search.timeRangeLabel", {
              defaultValue: "Time range",
            }),
            fromLabel: t("parkingSessionsPage.search.from", {
              defaultValue: "From",
            }),
            toLabel: t("parkingSessionsPage.search.to", { defaultValue: "To" }),
            presets: {
              CUSTOM: t("parkingSessionsPage.search.timePresets.custom", {
                defaultValue: "Custom",
              }),
              TODAY: t("parkingSessionsPage.search.timePresets.today", {
                defaultValue: "Today",
              }),
              YESTERDAY: t("parkingSessionsPage.search.timePresets.yesterday", {
                defaultValue: "Yesterday",
              }),
              LAST_7_DAYS: t(
                "parkingSessionsPage.search.timePresets.last7Days",
                { defaultValue: "Last 7 days" },
              ),
            },
          }}
          formatDateOnly={formatDateOnly}
        />
        <Button variant="text" onClick={handleClearFilters}>
          {t("common.filters.reset")}
        </Button>
      </Stack>

      {isError && (
        <Alert severity="error">
          {t("parkingSessionsPage.error", {
            defaultValue: "Could not load parking sessions.",
          })}
        </Alert>
      )}

      <Paper elevation={0}>
        <SoftDataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => (row as ParkingSessionAdminRow).id}
          maxHeight={520}
          emptyMessage={t("parkingSessionsPage.empty", {
            defaultValue: "No parking sessions yet.",
          })}
        />
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          labelRowsPerPage={t("common.pagination.rowsPerPage", {
            defaultValue: "Rows per page:",
          })}
          labelDisplayedRows={({ from, to, count }) =>
            t("common.pagination.displayedRows", {
              from,
              to,
              count,
              defaultValue: `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`,
            })
          }
        />
      </Paper>
      <PlateImagesDialog
        open={Boolean(selectedPlateImages)}
        onClose={() => setSelectedPlateImages(null)}
        checkInImageUrl={selectedPlateImages?.checkInImageUrl}
        checkOutImageUrl={selectedPlateImages?.checkOutImageUrl}
      />
    </Box>
  );
};
