import React from 'react';
import { Stack, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export type UserIdentityCellProps = {
  fullName?: string | null;
  userCode: string;
};

export const UserIdentityCell: React.FC<UserIdentityCellProps> = ({ fullName, userCode }) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={0.25} sx={{ lineHeight: 1.1 }}>
      <Tooltip title={t("common.tooltips.full_name", { defaultValue: "Full name" })} placement="top" arrow>
        <Typography variant="subtitle2" width="max-content" noWrap>
          {fullName || userCode}
        </Typography>
      </Tooltip>
      <Tooltip title={t("common.tooltips.user_code", { defaultValue: "User code" })} placement="top" arrow>
        <Typography variant="caption" color="text.secondary" width="max-content" noWrap>
          {userCode}
        </Typography>
      </Tooltip>
    </Stack>
  );
};

