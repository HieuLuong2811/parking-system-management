import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';
import type { BillingEventLogRecord, PaginatedResponse } from './types';

export type BillingEventLogFilters = {
  search?: string;
  page?: number;
  limit?: number;
};

const fetchBillingEvents = (filters: BillingEventLogFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  const query = params.toString();
  return httpGet<PaginatedResponse<BillingEventLogRecord>>(
    `/billing_event_logs${query ? `?${query}` : ''}`
  );
};

export const useBillingEvents = (filters: BillingEventLogFilters = {}) => {
  return useQuery({
    queryKey: ['admin', 'billingEvents', filters],
    queryFn: () => fetchBillingEvents(filters),
    staleTime: 1000 * 60,
    retry: false,
    placeholderData: (previousData) => previousData,
  });
};
