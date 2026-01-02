import React from 'react';
import {
  Box,
  Typography,
  MenuItem,
  IconButton,
} from '@mui/material';
import Select, {
  type SelectChangeEvent,
} from '@mui/material/Select';
import { ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material';

export interface PaginationBarProps {
  page: number;
  rowsPerPage: number;
  count?: number;
  rowsPerPageOptions?: number[];
  loading?: boolean;
  rowsPerPageLabel?: string;
  labelDisplayedRows?: (
    from: number,
    to: number,
    count?: number
  ) => string;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

const defaultLabelDisplayedRows = (
  from: number,
  to: number,
  count?: number
) => {
  if (typeof count === 'number') {
    return `${from}–${to} of ${count}`;
  }
  return `${from}–${to} of more than ${to}`;
};

export const PaginationBar: React.FC<PaginationBarProps> = ({
  page,
  rowsPerPage,
  count,
  rowsPerPageOptions = [10, 25, 50, 100],
  loading = false,
  rowsPerPageLabel = 'Rows per page:',
  labelDisplayedRows = defaultLabelDisplayedRows,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const from = page * rowsPerPage + 1;
  const to = Math.min(
    typeof count === 'number' ? count : from + rowsPerPage - 1,
    from + rowsPerPage - 1
  );

  const canGoBack = page > 0;
  const canGoNext =
    typeof count === 'number' ? to < count : true;

  const handleRowsPerPageChange = (
    event: SelectChangeEvent<number>
  ) => {
    onRowsPerPageChange(Number(event.target.value));
  };

  const handleBack = () => {
    if (canGoBack) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(page + 1);
    }
  };

  return (
    <Box
      component="section"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.25,
        borderRadius: 2.5,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        boxShadow: 1,
        flexWrap: 'wrap',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {rowsPerPageLabel}
      </Typography>
      <Select<number>
        size="small"
        value={rowsPerPage}
        onChange={handleRowsPerPageChange}
        sx={{ minWidth: 80 }}
      >
        {rowsPerPageOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
      <Typography variant="body2" color="text.secondary">
        {labelDisplayedRows(from, to, count)}
      </Typography>
      <Box
        sx={{
          ml: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <IconButton
          onClick={handleBack}
          disabled={!canGoBack || loading}
          aria-label="previous page"
          size="small"
        >
          <ArrowBackIosNew fontSize="small" />
        </IconButton>
        <IconButton
          onClick={handleNext}
          disabled={!canGoNext || loading}
          aria-label="next page"
          size="small"
        >
          <ArrowForwardIos fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};
