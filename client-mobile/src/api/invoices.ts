import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  clientHttp,
  requestWithContext,
  InvoiceInfo,
  InvoiceStatus,
  PaymentMethod,
  PaginatedResponse,
} from './clientApi';

const fetchInvoices = async (): Promise<InvoiceInfo[]> => {
  return requestWithContext(clientHttp.get<InvoiceInfo[]>('/invoices/me'), 'Load invoices');
};

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
    staleTime: 1000 * 60,
  });
};

export type InvoicesMeQuery = {
  page: number;
  limit: number;
  from_time?: string;
  to_time?: string;
  status?: InvoiceStatus;
};

const fetchInvoicesPaginated = async (params: InvoicesMeQuery): Promise<PaginatedResponse<InvoiceInfo>> => {
  return requestWithContext(
    clientHttp.get<PaginatedResponse<InvoiceInfo>>('/invoices/me/paginated', { params }),
    'Load invoices'
  );
};

export const useInvoicesPaginated = (params: InvoicesMeQuery) => {
  return useQuery({
    queryKey: ['invoices', 'me', 'paginated', params],
    queryFn: () => fetchInvoicesPaginated(params),
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev,
  });
};

export interface InvoiceCreatePayload {
  user_code: string;
  subscription_id?: string | null;
  amount: number;
  payment_method: PaymentMethod;
  status: InvoiceStatus;
  metadata?: Record<string, unknown>;
}

const createInvoice = async (payload: InvoiceCreatePayload): Promise<InvoiceInfo> => {
  return requestWithContext(clientHttp.post<InvoiceInfo>('/invoices', payload), 'Create invoice');
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InvoiceCreatePayload) => createInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};
