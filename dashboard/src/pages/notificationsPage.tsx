import React, { useMemo } from 'react';
import { Alert, Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useNotifications, type NotificationRecord } from '../api/notifications';
import { SoftDataGrid } from '../components/common/SoftDataGrid';
import { formatDateTime } from '../ultis/format';
import type { GridColDef } from '@mui/x-data-grid';
import { PageHeader } from '../components/common/PageHeader';

export const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const notificationsQuery = useNotifications();

  const rows = useMemo(() => {
    const raw = notificationsQuery.data ?? [];
    return raw
      .filter((item) => !item.deleted_at)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [notificationsQuery.data]);

  const columns = useMemo<GridColDef<NotificationRecord>[]>(() => {
    return [
      {
        field: 'title',
        headerName: t('notificationsPage.columns.title', { defaultValue: 'Title' }),
        minWidth: 220,
        flex: 1,
        renderCell: (params) => (
          <Tooltip title={String(params.value ?? '')}>
            <Typography variant="subtitle2" sx={{ fontWeight: params.row.is_read ? 500 : 700 }}>
              {String(params.value ?? '')}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: 'content',
        headerName: t('notificationsPage.columns.content', { defaultValue: 'Content' }),
        minWidth: 360,
        flex: 2,
        renderCell: (params) => (
          <Tooltip title={String(params.value ?? '')}>
            <Typography variant="body2" color="text.secondary" noWrap>
              {String(params.value ?? '')}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: 'is_read',
        headerName: t('notificationsPage.columns.status', { defaultValue: 'Status' }),
        minWidth: 130,
        renderCell: (params) =>
          params.row.is_read ? (
            <Chip size="small" label={t('notificationsPage.status.read', { defaultValue: 'Read' })} />
          ) : (
            <Chip
              size="small"
              color="secondary"
              label={t('notificationsPage.status.unread', { defaultValue: 'Unread' })}
            />
          ),
      },
      {
        field: 'created_at',
        headerName: t('notificationsPage.columns.createdAt', { defaultValue: 'Created at' }),
        minWidth: 190,
        renderCell: (params) => (
          <Typography variant="body2">{formatDateTime(String(params.value ?? ''))}</Typography>
        ),
      },
    ];
  }, [t]);

  return (
    <Box>
      <Stack direction="row" flexDirection="column" gap={2} sx={{ mb: 2 }}>
        <PageHeader
          title={t('notificationsPage.title', { defaultValue: 'Notifications' })}
          subtitle={t('notificationsPage.description', { defaultValue: 'Your latest notifications.' })}
        />
      </Stack>

      {notificationsQuery.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('notificationsPage.error', { defaultValue: 'Unable to load notifications.' })}
        </Alert>
      )}

      <SoftDataGrid
        rows={rows}
        columns={columns}
        loading={notificationsQuery.isLoading}
        getRowId={(row) => row.id}
        maxHeight={560}
        emptyMessage={t('notificationsPage.empty', { defaultValue: 'No notifications.' })}
        pagination
        initialPageSize={10}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </Box>
  );
};
