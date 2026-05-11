import React from 'react';
import { FormControl, MenuItem, Select, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useTranslation } from 'react-i18next';

export type RoleOption = { id: string; role_code: string };

type Props = {
  label: string;
  value: string;
  options: RoleOption[];
  onChange: (value: string) => void;
  valueKey?: 'id' | 'role_code';
  includeAllOption?: boolean;
  allLabel?: string;
  placeholder?: string;
  size?: 'small' | 'medium';
  minWidth?: number;
  useTypographyLabel?: boolean
};

export const RoleSelectField: React.FC<Props> = ({
  label,
  value,
  options,
  onChange,
  valueKey = 'id',
  includeAllOption = false,
  allLabel = 'All',
  placeholder = '',
  size = 'small',
  minWidth = 160,
  useTypographyLabel = false
}) => {
  const { t } = useTranslation();
  return (
    <div>
      {useTypographyLabel ? (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          {label}
        </Typography>
      ) : null}

      <FormControl sx={{ minWidth }} size={size}>
        <Select
          value={value}
          displayEmpty
          onChange={(event: SelectChangeEvent) => onChange(String(event.target.value))}
        >
          {includeAllOption ? <MenuItem value="">{allLabel}</MenuItem> : null}
          {placeholder ? (
            <MenuItem value="" disabled={!includeAllOption}>
              {placeholder}
            </MenuItem>
          ) : null}
          {options.map((role) => (
            <MenuItem key={role.id} value={valueKey === 'id' ? role.id : role.role_code}>
              {t(`common.roleTypes.${role.role_code}`)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};