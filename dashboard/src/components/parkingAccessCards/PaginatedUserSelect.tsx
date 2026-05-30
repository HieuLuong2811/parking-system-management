import React, { useMemo, useState } from 'react';
import { Autocomplete, Box, CircularProgress, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useInfiniteQuery } from '@tanstack/react-query';
import { httpGet } from '../../api/httpClient';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

export type PaginatedUserSelectProps = {
  value: string;
  disabled?: boolean;
  error?: string;
  onChange: (userCode: string) => void;
};

type EligibleUser = {
  user_code: string;
  full_name: string;
  email?: string | null;
};

const PAGE_SIZE = 5;

const toOptionLabel = (user: EligibleUser) => {
  const code = user.user_code ? String(user.user_code) : '';
  const name = user.full_name ?? '';
  const email = user.email ?? '';
  const parts = [code && `#${code}`, name, email].filter(Boolean);
  return parts.join(' — ');
};

export const PaginatedUserSelect: React.FC<PaginatedUserSelectProps> = ({
  value,
  disabled = false,
  error,
  onChange,
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const debouncedInput = useDebouncedValue(inputValue, 300);

  const trimmed = (debouncedInput || '').trim();
  const isNumericQuery = /^[0-9]+$/.test(trimmed);

  const baseParams = useMemo(() => {
    const params = new URLSearchParams();
    if (isNumericQuery && trimmed) params.append('user_code', trimmed);
    if (!isNumericQuery && trimmed) params.append('nameOrEmail', trimmed);
    params.append('is_deleted', String(false));
    params.append('limit', String(PAGE_SIZE));
    return params;
  }, [isNumericQuery, trimmed]);

  const usersQuery = useInfiniteQuery({
    queryKey: ['admin', 'usersSelect', { q: trimmed, isNumericQuery }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams(baseParams);
      params.set('page', String(pageParam));
      return httpGet<{ data: EligibleUser[]; total_pages: number; page: number }>(
        `/parking_access_cards/eligible_users?${params.toString()}`
      );
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = lastPage?.total_pages ?? 0;
      const next = allPages.length + 1;
      if (totalPages && next > totalPages) return undefined;
      if (!totalPages && (lastPage?.data?.length ?? 0) < PAGE_SIZE) return undefined;
      return next;
    },
    staleTime: 0,
    retry: false,
  });

  const options = useMemo<EligibleUser[]>(() => {
    const pages = usersQuery.data?.pages ?? [];
    const merged: EligibleUser[] = [];
    const seen = new Set<string>();
    for (const p of pages) {
      for (const u of p?.data ?? []) {
        const key = String(u.user_code);
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(u);
      }
    }
    return merged;
  }, [usersQuery.data]);

  const selectedUser = useMemo(() => {
    if (!value) return null;
    return options.find((u) => String(u.user_code) === String(value)) ?? null;
  }, [options, value]);

  return (
    <Autocomplete
      disabled={disabled}
      options={options}
      value={selectedUser}
      inputValue={inputValue}
      onInputChange={(_event, next) => {
        setInputValue(next);
      }}
      onChange={(_event, next) => onChange(next?.user_code ? String(next.user_code) : '')}
      loading={usersQuery.isFetching}
      getOptionLabel={(option) => toOptionLabel(option)}
      isOptionEqualToValue={(option, val) => String(option.user_code) === String(val.user_code)}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={String(option.user_code)}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2">{option.full_name || '-'}</Typography>
            <Typography variant="caption" color="text.secondary">
              #{String(option.user_code)} {option.email ? `• ${option.email}` : ''}
            </Typography>
          </Box>
        </Box>
      )}
      ListboxProps={{
        onScroll: (event) => {
          const listboxNode = event.currentTarget;
          const reachedBottom =
            listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - 8;
          if (!reachedBottom) return;
          if (usersQuery.isFetchingNextPage) return;
          if (!usersQuery.hasNextPage) return;
          usersQuery.fetchNextPage();
        },
        style: { maxHeight: 300, overflow: 'auto' },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label={undefined}
          error={!!error}
          helperText={error}
          placeholder={t('parkingAccessCardsPage.form.userPlaceholder', {
            defaultValue: 'Search by name, user code, or email',
          })}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {usersQuery.isFetching ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};
