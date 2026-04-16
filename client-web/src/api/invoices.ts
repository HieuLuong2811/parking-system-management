import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  clientHttp,
  requestWithContext,
  InvoiceInfo,
  InvoiceStatus,
  PaymentMethod,
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

export interface InvoiceCreatePayload {
  user_code: string;
  subscription_id?: string | null;
  amount: number;
  payment_method: PaymentMethod;
  status: InvoiceStatus;
  metadata?: Record<string, unknown>;
  stripe_invoice_id?: string | null;
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
