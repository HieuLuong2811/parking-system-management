import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
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
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import SectionCard from "../components/shared/SectionCard";
import {
  exportMyParkingSessionsXlsx,
  useParkingSessions,
} from "../api/parking_sessions";
import theme from "../theme";
import {
  formatCurrency,
  formatDateTime,
  formatLocalDateTimeInput,
  toEndOfDay,
  toStartOfDay,
} from "../ultis/formatters";
import { statusColor } from "../ultis/status";
import { LAST_7_DAYS } from "../constant/config";
import FilterListIcon from "@mui/icons-material/FilterList";
import useDebouncedValue from "../hooks/useDebouncedValue";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CloseIcon from "@mui/icons-material/Close";

export default function SessionPage() {
  const { t } = useTranslation();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState<"" | "ACTIVE" | "DONE">("");
  const debouncedFromDate = useDebouncedValue(fromDate, 500);
  const debouncedToDate = useDebouncedValue(toDate, 500);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const {
    data: paginated,
    isLoading,
    isError,
  } = useParkingSessions({
    page: page + 1,
    limit: rowsPerPage,
    status: status || undefined,
    from_time: toStartOfDay(debouncedFromDate) || undefined,
    to_time: toEndOfDay(debouncedToDate) || undefined,
  });
  const sessions = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;

  useEffect(() => {
    setPage(0);
  }, [debouncedFromDate, debouncedToDate, status]);

  const filterFields = [
    { key: "from", type: "date", value: fromDate, setter: setFromDate },
    { key: "to", type: "date", value: toDate, setter: setToDate },
  ];

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setStatus("");
    setPage(0);
  };

  const [exportOpen, setExportOpen] = useState(false);
  const [exportRange, setExportRange] = useState<"today" | "last7" | "custom">(
    "today",
  );
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const [exportBusy, setExportBusy] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const openExportDialog = () => {
    setExportError(null);
    setExportBusy(false);
    setExportRange("today");
    setExportFrom(fromDate);
    setExportTo(toDate);
    setExportOpen(true);
  };

  const closeExportDialog = () => {
    if (exportBusy) return;
    setExportOpen(false);
  };

  const handleExport = async () => {
    setExportError(null);
    setExportBusy(true);
    try {
      const now = new Date();
      let resolvedFrom = exportFrom;
      let resolvedTo = exportTo;

      if (exportRange === "today") {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        resolvedFrom = formatLocalDateTimeInput(start);
        resolvedTo = formatLocalDateTimeInput(now);
      } else if (exportRange === "last7") {
        const start = new Date(now.getTime() - LAST_7_DAYS);
        resolvedFrom = formatLocalDateTimeInput(start);
        resolvedTo = formatLocalDateTimeInput(now);
      } else if (exportRange === "custom") {
        if (!resolvedFrom || !resolvedTo) {
          setExportError(t("common.error"));
          return;
        }

        resolvedFrom = toStartOfDay(resolvedFrom) ?? "";
        resolvedTo = toEndOfDay(resolvedTo) ?? "";
      }

      const { blob, filename } = await exportMyParkingSessionsXlsx({
        from_time: resolvedFrom,
        to_time: resolvedTo,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setExportOpen(false);
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : t("common.error"),
      );
    } finally {
      setExportBusy(false);
    }
  };

  const tableColumns = ["vehicle", "checkIn", "checkOut", "status", "amount"];

  const pagedSessions = useMemo(() => sessions, [sessions]);

  return (
    <SectionCard>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 0.5,
          }}
        >
          {t("sessions.sectionTitle")}
        </Typography>

        <Typography variant="body2" fontSize="medium" color="text.secondary">
          {t("sessions.subtitle", {
            defaultValue:
              "Theo dõi lịch sử gửi xe, thời điểm vào/ra và trạng thái phiên gửi xe của bạn.",
          })}
        </Typography>
      </Box>
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 3,
          bgcolor: "#F8FAFC",
          border: "1px solid #E5E7EB",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          spacing={2}
          display="flex"
          justifyContent="space-between"
          gap={1}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            gap={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                minWidth: 130,
              }}
            >
              <FilterListIcon color="primary" fontSize="small" />
              <Typography variant="body2" fontWeight={600}>
                {t("common.filters.search")}
              </Typography>
            </Box>
            {filterFields.map(({ key, type, value, setter }) => (
              <TextField
                key={key}
                label={t(`sessions.filters.${key}`)}
                type={type}
                value={value}
                onChange={(event) => {
                  const next = event.target.value;
                  if (key === "from") {
                    setFromDate(next);
                    if (toDate && next && next > toDate) {
                      setToDate(next);
                    }
                    return;
                  }
                  if (key === "to") {
                    setToDate(next);
                    if (fromDate && next && next < fromDate) {
                      setFromDate(next);
                    }
                    return;
                  }
                  setter(next);
                }}
                InputLabelProps={{ shrink: true }}
                inputProps={
                  key === "from"
                    ? { max: toDate || undefined }
                    : key === "to"
                      ? { min: fromDate || undefined }
                      : undefined
                }
                disabled={isLoading || isError}
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 180 },
                  bgcolor: "#FFFFFF",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            ))}
            <TextField
              select
              SelectProps={{ native: true }}
              label={t("sessions.filters.status", { defaultValue: "Status" })}
              value={status}
              onChange={(event) =>
                setStatus((event.target.value as "ACTIVE" | "DONE" | "") || "")
              }
              disabled={isLoading || isError}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{
                minWidth: { xs: "100%", sm: 180 },
                bgcolor: "#FFFFFF",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            >
              <option value="">
                {t("common.all", { defaultValue: "All" })}
              </option>
              <option value="ACTIVE">
                {t("common.sessionStatus.ACTIVE", { defaultValue: "Active" })}
              </option>
              <option value="DONE">
                {t("common.sessionStatus.DONE", { defaultValue: "Done" })}
              </option>
            </TextField>
            <Button
              onClick={clearFilters}
              disabled={!fromDate && !toDate && !status}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 2.5,
                bgcolor: "#FFFFFF",
              }}
            >
              {t("common.filters.reset")}
            </Button>
          </Stack>
          <Button
            variant="contained"
            color="primary"
            onClick={openExportDialog}
            startIcon={<FileDownloadIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 2.5,
              fontWeight: 600,
              boxShadow: "0 4px 10px rgba(25, 118, 210, 0.25)",
            }}
          >
            {t("sessions.actions.exportExcel", {
              defaultValue: "Export Excel",
            })}
          </Button>
        </Stack>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          overflow: "hidden",
          bgcolor: "#FFFFFF",
        }}
      >
        {isLoading ? (
          <SectionCard>
            <Typography>{t("sessions.loading")}</Typography>
          </SectionCard>
        ) : isError ? (
          <SectionCard>
            <Typography color="error">{t("sessions.error")}</Typography>
          </SectionCard>
        ) : (
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: "#F8FAFC",
                  "& th": {
                    fontWeight: 700,
                    color: "#334155",
                    fontSize: 14,
                    py: 1.75,
                    borderBottom: "1px solid #E5E7EB",
                  },
                }}
              >
                {tableColumns.map((column) => (
                  <TableCell key={column}>
                    {t(`sessions.table.${column}`)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedSessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} align="center">
                    <Box sx={{ py: 6 }}>
                      <LocalParkingIcon
                        sx={{ fontSize: 48, color: "#CBD5E1", mb: 1 }}
                      />
                      <Typography fontWeight={700} color="text.primary">
                        {t("sessions.empty")}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              {pagedSessions.map((session) => (
                <TableRow
                  key={session.id}
                  sx={{
                    transition: "0.2s",
                    "&:hover": {
                      bgcolor: "#F9FAFB",
                    },
                    "& td": {
                      py: 1.8,
                      fontSize: 14,
                      borderBottom: "1px solid #EEF2F7",
                    },
                  }}
                >
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography fontWeight={600}>
                        {t(`common.vehicleType.${session.vehicle_mode}`, {
                          defaultValue:
                            session.vehicle_mode === "LICENSED"
                              ? "Xe có biển số"
                              : "Xe không biển số",
                        })}
                      </Typography>

                      {session.vehicle_mode === "LICENSED" &&
                      session.license_plate ? (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#3b4450",
                            fontWeight: 600,
                          }}
                        >
                          {t("common.licensePlateLabel", {
                            license: session.license_plate,
                            defaultValue: `BKS: ${session.license_plate}`,
                          })}
                        </Typography>
                      ) : null}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography fontWeight={500}>
                        {formatDateTime(session.check_in_time) ??
                          t("sessions.notProvided")}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    {session.check_out_time ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography fontWeight={500}>
                          {formatDateTime(session.check_out_time)}
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography color="text.secondary" fontStyle="italic">
                        {"-"}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`common.sessionStatus.${session.status}`)}
                      color={statusColor(session.status)}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      fontWeight={700}
                      color={
                        session.total_amount ? "text.primary" : "text.secondary"
                      }
                    >
                      {session.total_amount
                        ? formatCurrency(session.total_amount)
                        : "-"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
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
        sx={{
          "& .MuiTablePagination-toolbar": { justifyContent: "flex-end" },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            {
              color: theme.palette.text.secondary,
            },
        }}
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

      <Dialog
        open={exportOpen}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center" , justifyContent: "space-between"}}>
          {t("sessions.actions.exportTitle", {
            defaultValue: "Export check in/out history",
          })}
          <IconButton
            aria-label="close"
            onClick={() => setExportOpen(false)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {exportError ? (
            <Typography color="error" sx={{ mb: 1 }}>
              {exportError}
            </Typography>
          ) : null}

          <FormControl component="fieldset" sx={{ mt: 1 }}>
            <FormLabel>
              {t("sessions.actions.rangeLabel", { defaultValue: "Time range" })}
            </FormLabel>
            <RadioGroup
              value={exportRange}
              onChange={(event) =>
                setExportRange(
                  event.target.value as "today" | "last7" | "custom",
                )
              }
            >
              <FormControlLabel
                value="today"
                control={<Radio />}
                label={t("sessions.actions.today", { defaultValue: "Today" })}
              />
              <FormControlLabel
                value="last7"
                control={<Radio />}
                label={t("sessions.actions.last7Days", {
                  defaultValue: "Last 7 days",
                })}
              />
              <FormControlLabel
                value="custom"
                control={<Radio />}
                label={t("sessions.actions.customRange", {
                  defaultValue: "Custom range",
                })}
              />
            </RadioGroup>
          </FormControl>

          {exportRange === "custom" ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mt: 1 }}
            >
              <TextField
                label={t("sessions.filters.from")}
                type="date"
                value={exportFrom}
                onChange={(event) => {
                  const next = event.target.value;
                  setExportFrom(next);
                  if (exportTo && next && next > exportTo) {
                    setExportTo(next);
                  }
                }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: exportTo || undefined }}
                disabled={exportBusy}
                sx={{ flex: 1 }}
              />
              <TextField
                label={t("sessions.filters.to")}
                type="date"
                value={exportTo}
                onChange={(event) => {
                  const next = event.target.value;
                  setExportTo(next);
                  if (exportFrom && next && next < exportFrom) {
                    setExportFrom(next);
                  }
                }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: exportFrom || undefined }}
                disabled={exportBusy}
                sx={{ flex: 1 }}
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeExportDialog} disabled={exportBusy}>
            {t("common.button.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={exportBusy}
          >
            {t("sessions.actions.export", { defaultValue: "Export" })}
          </Button>
        </DialogActions>
      </Dialog>
    </SectionCard>
  );
}
