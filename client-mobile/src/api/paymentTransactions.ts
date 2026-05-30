import type { PaymentMethod, PaymentStatus } from './clientApi';
import { getStoredSession, isExpired } from '../auth/authStorage';
import { apiClient } from './client';
import { EXPO_PUBLIC_API_URL } from '../constant/config';
import { joinUrl } from '../ultis/url';
import { useQuery } from '@tanstack/react-query';

function withAuthHeader(headers: Record<string, string> | undefined, token: string) {
  return { ...(headers ?? {}), Authorization: `Bearer ${token}` };
}

async function getValidAccessToken() {
  const session = await getStoredSession();
  if (!session) return null;
  if (isExpired(session.expiresAt)) return null;
  return session.accessToken;
}

export type PaymentTransactionType =
  | 'TOP_UP'
  | 'SUBSCRIPTION_FULL_PAYMENT'
  | 'MONTHLY_CHARGE'
  | 'INVOICE_DIRECT_PAYMENT'
  | 'REFUND'
  | 'ADMIN_ADJUSTMENT';

export type PaymentTransactionDirection = 'IN' | 'OUT';

export type PaymentTransactionDetail = {
  payment_transaction_id: string;
  invoice_id: string | null;
  attempt_number: number | null;
  transaction_code: string | null;
  transaction_type: PaymentTransactionType;
  payment_method: PaymentMethod;
  amount: string;
  status: PaymentStatus | string;
  balance_before: string | null;
  balance_after: string | null;
  created_at: string;
  user_code: string;
  user_full_name: string | null;
  invoice_amount: number | null;
  invoice_payment_method: PaymentMethod | null;
  invoice_status: string | null;
  invoice_created_at: string | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

const PAYMENT_TRANSACTIONS_ME_DETAILS_URL = joinUrl(EXPO_PUBLIC_API_URL, 'payment_transactions/me/details');

export type MyTransactionFilters = {
  page?: number;
  limit?: number;
  from_time?: string;
  to_time?: string;
  invoice_id?: string;
  transaction_code?: string;
  transaction_type?: PaymentTransactionType;
  direction?: PaymentTransactionDirection;
};

export async function listMyTransactionDetails(filters: MyTransactionFilters): Promise<PaginatedResponse<PaymentTransactionDetail>> {
  const token = await getValidAccessToken();
  if (!token) throw new Error('No valid access token');
  const res = await apiClient.get<PaginatedResponse<PaymentTransactionDetail>>(PAYMENT_TRANSACTIONS_ME_DETAILS_URL, {
    params: filters,
    headers: withAuthHeader(undefined, token),
    withCredentials: true,
  });
  return res.data;
}

export function useMyTransactionDetails(filters: MyTransactionFilters) {
  return useQuery({
    queryKey: ['payment_transactions', 'me_details', filters],
    queryFn: () => listMyTransactionDetails(filters),
    staleTime: 1000 * 30,
  });
}
