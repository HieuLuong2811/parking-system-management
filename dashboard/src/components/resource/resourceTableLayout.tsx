import { Box, Alert, Divider, Stack, TextField, Typography, Snackbar, Button } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import React, { useMemo } from 'react';

import { SoftDataGrid } from '../common/SoftDataGrid';

type SearchValue = string | number | undefined | null;

type RowIdentifier<RowType> = (row: RowType) => string | number;

interface ResourceTableLayoutProps<RowType extends Record<string, unknown>> {
  title: string;
  description?: string;
  columns: GridColDef<RowType>[];
  rows: RowType[];
  loading?: boolean;
  error?: unknown;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchLabel?: string;
  searchPlaceholder?: string;
  searchKeys: (row: RowType) => SearchValue[];
  filterControls?: React.ReactNode;
  onClearFilters?: () => void;
  clearLabel?: string;
  emptyMessage?: string;
  maxHeight?: number | string;
  getRowId?: RowIdentifier<RowType>;
  footer?: React.ReactNode;
}

export const ResourceTableLayout = <RowType extends Record<string, unknown>>({
  title,
  description,
  columns,
  rows,
  loading,
  error,
  searchTerm,
  onSearchChange,
  searchLabel = 'Search',
  searchPlaceholder = 'Search records',
  searchKeys,
  filterControls,
  onClearFilters,
  clearLabel = 'Clear filters',
  emptyMessage = 'No records found',
  maxHeight = 460,
  getRowId,
  footer,
}: ResourceTableLayoutProps<RowType>) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredRows = useMemo(() => {
    if (!normalizedSearch) {
      return rows;
    }
    return rows.filter((row) =>
      searchKeys(row).some((value) => {
        if (value === null || value === undefined) {
          return false;
        }
        return String(value).toLowerCase().includes(normalizedSearch);
      })
    );
  }, [normalizedSearch, rows, searchKeys]);

  const errorMessage = useMemo(() => {
    if (!error) {
      return '';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }, [error]);

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h5">{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            pt: 1,
          }}
        >
          <TextField
            label={searchLabel}
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            size="small"
            sx={{ flex: '1 1 280px', minWidth: 260 }}
          />
          {(filterControls || onClearFilters) && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              {filterControls}
              {onClearFilters && (
                <Button variant="outlined" size="small" onClick={onClearFilters}>
                  {clearLabel}
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Stack>

      {errorMessage && (
        <Snackbar open={Boolean(errorMessage)} autoHideDuration={6000} onClose={() => {}} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      )}

      <Divider />

      <Box sx={{ mt: 2 }}>
        <SoftDataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          getRowId={getRowId}
          maxHeight={maxHeight}
          emptyMessage={emptyMessage}
        />
      </Box>

      {footer && <Box sx={{ mt: 1 }}>{footer}</Box>}
    </Box>
  );
};
