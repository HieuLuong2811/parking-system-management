import {
  Box,
  IconButton,
  Skeleton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import SortIcon from "@mui/icons-material/Sort";
import { useMemo, useState } from "react";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

type RowIdentifier<RowType> = (row: RowType) => string | number;

type SortDirection = "asc" | "desc";
type SortConfig = {
  field: string;
  direction: SortDirection;
};

interface SoftDataGridProps<RowType extends Record<string, unknown>> {
  rows: RowType[];
  columns: GridColDef<RowType>[];
  loading?: boolean;
  getRowId?: RowIdentifier<RowType>;
  skeletonRowCount?: number;
  maxHeight?: string | number;
  onSort?: (field: string, direction: SortDirection) => void;
  sortConfig?: SortConfig;
  emptyMessage?: string;
  pagination?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

const defaultMaxHeight = 420;

export const SoftDataGrid = <
  RowType extends Record<string, unknown> = Record<string, unknown>,
>({
  rows,
  columns,
  loading,
  getRowId,
  skeletonRowCount = 4,
  maxHeight = defaultMaxHeight,
  onSort,
  sortConfig,
  emptyMessage = "No records found",
  pagination = false,
  initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
}: SoftDataGridProps<RowType>) => {
  const theme = useTheme();
  const computedRows = useMemo(() => rows ?? [], [rows]);
  const [internalSort, setInternalSort] = useState<SortConfig | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialPageSize);

  const activeSort = sortConfig ?? internalSort;
  const maxPage = useMemo(() => {
    if (!pagination) return 0;
    return Math.max(0, Math.ceil(computedRows.length / rowsPerPage) - 1);
  }, [computedRows.length, pagination, rowsPerPage]);
  const safePage = useMemo(() => {
    if (!pagination) return 0;
    return Math.min(page, maxPage);
  }, [maxPage, page, pagination]);

  const paginatedRows = useMemo(() => {
    if (!pagination) return computedRows;
    const start = safePage * rowsPerPage;
    return computedRows.slice(start, start + rowsPerPage);
  }, [computedRows, pagination, rowsPerPage, safePage]);

  const renderCellContent = (column: GridColDef<RowType>, row: RowType) => {
    if (column.renderCell) {
      const params: GridRenderCellParams<RowType> = {
        id: getRowId
          ? getRowId(row)
          : ((row as Record<string, unknown>)[column.field] ?? ""),
        field: column.field,
        row,
        value: row[column.field as keyof RowType],
        colDef: column,
      } as GridRenderCellParams<RowType>;
      return column.renderCell(params);
    }

    const value = row[column.field as keyof RowType];
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    return String(value);
  };

  const deriveRowKey = (row: RowType, index: number) => {
    if (getRowId) {
      return getRowId(row);
    }
    const fallbackKey = columns[0]?.field;
    const fallbackValue =
      fallbackKey && typeof fallbackKey === "string"
        ? (row as Record<string, unknown>)[fallbackKey]
        : undefined;
    if (
      typeof fallbackValue === "string" ||
      typeof fallbackValue === "number"
    ) {
      return fallbackValue;
    }
    return index;
  };

  const skeletonRows = Array.from({ length: skeletonRowCount });

  const handleHeaderSort = (column: GridColDef<RowType>) => {
    if (!column.sortable) return;
    const nextDirection: SortDirection =
      activeSort?.field === column.field && activeSort.direction === "asc"
        ? "desc"
        : "asc";
    const config: SortConfig = {
      field: column.field,
      direction: nextDirection,
    };
    if (!sortConfig) {
      setInternalSort(config);
    }
    onSort?.(column.field, nextDirection);
  };

  return (
    <Paper
      elevation={0}
      sx={[
        {
          width: "100%",
          backgroundColor: theme.palette.background.paper,
          position: "relative",
          boxShadow: "none",
        },
      ]}
    >
      <TableContainer component={Box} sx={[{ maxHeight, overflowY: "auto" }]}>
        <Table
          stickyHeader
          sx={{ borderCollapse: "collapse", border: "1px solid #dcdcdc" }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "rgba(23, 119, 240, 0.12)" }}>
              {columns.map((column, index) => (
                <TableCell
                  key={`column-${column.field}-${index}`}
                  align={column.headerAlign ?? column.align ?? "left"}
                  sx={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    borderBottom: "none",
                    minWidth: column.width ?? column.minWidth ?? 120,
                    maxWidth: column.width ? column.width + 60 : 340,
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    backgroundColor: "#c8ceff",
                    borderRight: "1px solid #dcdcdc",
                    px: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      width: "100%",
                      justifyContent:
                        column.headerAlign === "center"
                          ? "center"
                          : column.headerAlign === "right"
                            ? "flex-end"
                            : "flex-start",
                    }}
                  >
                    <Typography component="span" sx={{ fontWeight: 600 }}>
                      {column.headerName}
                    </Typography>
                    {column.sortable && (
                      <IconButton
                        size="small"
                        onClick={() => handleHeaderSort(column)}
                        sx={{
                          color:
                            activeSort?.field === column.field
                              ? theme.palette.primary.main
                              : theme.palette.text.secondary,
                          "&:hover": {
                            backgroundColor: "rgba(94, 79, 216, 0.12)",
                          },
                        }}
                        aria-label={`Sort by ${column.headerName}`}
                      >
                        {activeSort?.field === column.field ? (
                          activeSort.direction === "asc" ? (
                            <ArrowUpwardIcon fontSize="small" />
                          ) : (
                            <ArrowDownwardIcon fontSize="small" />
                          )
                        ) : (
                          <SortIcon fontSize="small" />
                        )}
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              backgroundColor: theme.palette.background.default,
              borderCollapse: "collapse",
            }}
          >
            {loading && computedRows.length === 0 ? (
              skeletonRows.map((_, index) => (
                <TableRow
                  key={`skeleton-${index}`}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: "#ffffff",
                    "&:hover": {
                      backgroundColor: "#eef0ff",
                    },
                  }}
                >
                  {columns.map((column, index) => (
                    <TableCell
                      key={`column-${column.field}-${index}`}
                      align={column.align ?? "left"}
                      sx={{
                        py: 2,
                        px: 2,
                        maxWidth: column.width ?? 300,
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        borderRight: "1px solid rgba(15, 23, 42, 0.04)",
                      }}
                    >
                      <Skeleton animation="wave" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : computedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 6 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, index) => (
                <TableRow
                  key={deriveRowKey(row, index)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: "#ffffff",
                    "&:hover": {
                      backgroundColor: "#eef0ff",
                    },
                  }}
                >
                  {columns.map((column, index) => (
                    <TableCell
                      key={`column-${column.field}-${index}`}
                      align={column.align ?? "left"}
                      sx={{
                        borderBottom: "none",
                        py: 2,
                        px: 2,
                        maxWidth: column.width ?? 300,
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        borderRight: "1px solid rgba(15, 23, 42, 0.04)",
                      }}
                    >
                      {renderCellContent(column, row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && computedRows.length > 0 && (
        <TablePagination
          component="div"
          count={computedRows.length}
          page={safePage}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            const nextSize = Number(event.target.value);
            setRowsPerPage(
              Number.isFinite(nextSize) && nextSize > 0
                ? nextSize
                : initialPageSize,
            );
            setPage(0);
          }}
          rowsPerPageOptions={pageSizeOptions}
        />
      )}
    </Paper>
  );
};
