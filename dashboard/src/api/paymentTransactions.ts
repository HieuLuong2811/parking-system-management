import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';
import type { PaginatedResponse, PaymentTransactionDetailRecord } from './types';

export type PaymentTransactionFilters = {
  search?: string;
  user_code?: string;
  invoice_id?: string;
  transaction_code?: string;
  from_time?: string;
  to_time?: string;
  page?: number;
  limit?: number;
};

const fetchPaymentTransactions = (filters: PaymentTransactionFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.user_code) params.append('user_code', filters.user_code);
  if (filters.invoice_id) params.append('invoice_id', filters.invoice_id);
  if (filters.transaction_code) params.append('transaction_code', filters.transaction_code);
  if (filters.from_time) params.append('from_time', filters.from_time);
  if (filters.to_time) params.append('to_time', filters.to_time);
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
