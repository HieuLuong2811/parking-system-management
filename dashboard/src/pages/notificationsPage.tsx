import React, { useMemo } from 'react';
import { Alert, Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useNotifications } from '../api/notifications';
import { formatDateTime } from '../ultis/format';
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

      {notificationsQuery.isLoading ? (
        <Typography variant="body2" color="text.secondary">
          {t('common.loading', { defaultValue: 'Loading...' })}
        </Typography>
      ) : rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('notificationsPage.empty', { defaultValue: 'No notifications.' })}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {rows.map((item) => (
            <Card key={item.id} variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: item.is_read ? 600 : 800 }} noWrap>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                      {item.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      {formatDateTime(item.created_at)}
                    </Typography>
                  </Box>

                  <Chip
                    size="small"
                    color={item.is_read ? 'default' : 'secondary'}
                    label={
                      item.is_read
                        ? t('notificationsPage.status.read', { defaultValue: 'Read' })
                        : t('notificationsPage.status.unread', { defaultValue: 'Unread' })
                    }
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};
