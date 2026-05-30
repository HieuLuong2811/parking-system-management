import { useQuery } from '@tanstack/react-query';
import { httpGet } from './httpClient';
import type { InvoiceAdminRecord } from './types';

export type InvoiceSearchFilters = {
  query?: string;
  status?: string;
  invoice_id?: string;
  subscriptionId?: string;
};

const fetchInvoices = () => httpGet<InvoiceAdminRecord[]>('/invoices/');
export type SubscriptionInvoicesResponse = {
  user_code: string | null;
  full_name: string | null;
  data: InvoiceAdminRecord[];
};

const fetchSubscriptionInvoices = (subscriptionId: string) =>
  httpGet<SubscriptionInvoicesResponse>(
    `/invoices/by-subscription/${subscriptionId}`
  );

export const useSubscriptionInvoices = (subscriptionId?: string, filters?: InvoiceSearchFilters) => {
  return useQuery({
    queryKey: ['admin', 'subscriptionInvoices', subscriptionId, filters],
    queryFn: () => fetchSubscriptionInvoices(subscriptionId!),
    enabled: Boolean(subscriptionId),
    staleTime: 1000 * 60,
  });
};

export const useInvoices = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
    staleTime: 1000 * 60,
  });

  return { data, isLoading, isError, error };
};
