import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';
import type { PaginatedResponse, PaymentTransactionDetailRecord } from './types';

export type PaymentTransactionFilters = {
  search?: string;
  page?: number;
  limit?: number;
};

const fetchPaymentTransactions = (filters: PaymentTransactionFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  const query = params.toString();
  return httpGet<PaginatedResponse<PaymentTransactionDetailRecord>>(
    `/payment_transactions/details${query ? `?${query}` : ''}`
  );
};

export const usePaymentTransactions = (filters: PaymentTransactionFilters = {}) => {
  return useQuery({
    queryKey: ['admin', 'paymentTransactions', filters],
    queryFn: () => fetchPaymentTransactions(filters),
    staleTime: 1000 * 60,
    retry: false,
    placeholderData: (previousData) => previousData,
  });
};
