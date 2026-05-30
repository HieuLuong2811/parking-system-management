import React, { useMemo, useState } from "react";
import { Box, InputAdornment, MenuItem, Popover, Stack, TextField } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export type TimeRangePreset = "CUSTOM" | "TODAY" | "YESTERDAY" | "LAST_7_DAYS";

export type TimeRangeValue = {
  preset: TimeRangePreset;
  from: string;
  to: string;
};

type Labels = {
  triggerLabel: string;
  presetLabel: string;
  fromLabel: string;
  toLabel: string;
  presets: Record<TimeRangePreset, string>;
};

export type TimeRangePopoverFilterProps = {
  value: TimeRangeValue;
  onChange: (next: TimeRangeValue) => void;
  labels: Labels;
  minWidth?: number;
  formatDateOnly?: (value?: string | null) => string;
};

const pad2 = (value: number) => String(value).padStart(2, "0");
const toLocalDateInputValue = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const applyPreset = (current: TimeRangeValue, nextPreset: TimeRangePreset): TimeRangeValue => {
  const now = new Date();

  if (nextPreset === "CUSTOM") {
    return { ...current, preset: "CUSTOM" };
  }

  if (nextPreset === "TODAY") {
    const today = toLocalDateInputValue(now);
    return { preset: "TODAY", from: today, to: today };
  }

  if (nextPreset === "YESTERDAY") {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const y = toLocalDateInputValue(yesterday);
    return { preset: "YESTERDAY", from: y, to: y };
  }

  const from = new Date(now);
  from.setDate(now.getDate() - 6);
  return {
    preset: "LAST_7_DAYS",
    from: toLocalDateInputValue(from),
    to: toLocalDateInputValue(now),
  };
};

export const TimeRangePopoverFilter: React.FC<TimeRangePopoverFilterProps> = ({
  value,
  onChange,
  labels,
  minWidth = 260,
  formatDateOnly,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const displayValue = useMemo(() => {
    if (value.preset !== "CUSTOM") return labels.presets[value.preset];
    const customLabel = labels.presets.CUSTOM;
    if (!value.from && !value.to) return customLabel;
    const fromLabel = value.from ? (formatDateOnly ? formatDateOnly(value.from) : value.from) : "-";
    const toLabel = value.to ? (formatDateOnly ? formatDateOnly(value.to) : value.to) : "-";
    return `${fromLabel} → ${toLabel}`;
  }, [formatDateOnly, labels.presets, value.from, value.preset, value.to]);

  return (
    <>
      <TextField
        size="small"
        label={labels.triggerLabel}
        value={displayValue}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <KeyboardArrowDownIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth }}
      />

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Box sx={{ p: 2, maxWidth: "calc(100vw - 32px)" }}>
          <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
            <TextField
              select
              size="small"
              label={labels.presetLabel}
              value={value.preset}
              onChange={(e) => onChange(applyPreset(value, e.target.value as TimeRangePreset))}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="CUSTOM">{labels.presets.CUSTOM}</MenuItem>
              <MenuItem value="TODAY">{labels.presets.TODAY}</MenuItem>
              <MenuItem value="YESTERDAY">{labels.presets.YESTERDAY}</MenuItem>
              <MenuItem value="LAST_7_DAYS">{labels.presets.LAST_7_DAYS}</MenuItem>
            </TextField>

            <TextField
              size="small"
              label={labels.fromLabel}
              type="date"
              value={value.from}
              onChange={(e) => onChange({ ...value, preset: "CUSTOM", from: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              size="small"
              label={labels.toLabel}
              type="date"
              value={value.to}
              onChange={(e) => onChange({ ...value, preset: "CUSTOM", to: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

