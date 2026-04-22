import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clientHttp, requestWithContext } from './clientApi';

export type MomoCreateResponse = {
  payUrl?: string;
  deeplink?: string;
  shortLink?: string;
  qrCodeUrl?: string;
  deeplinkWebInApp?: string;
  deeplinkMiniApp?: string;
  resultCode?: number | string;
  message?: string;
  [key: string]: unknown;
};

export interface MomoInvoicePayRequest {
  redirectUrl?: string;
  orderInfo?: string;
  extraData?: string;
  lang?: string;
  amount?: string;
}

const createMomoPaymentForInvoice = async (
  invoiceId: string,
  payload: MomoInvoicePayRequest
): Promise<MomoCreateResponse> => {
  return requestWithContext(
    clientHttp.post<MomoCreateResponse>(`/payment/momo/invoice/${invoiceId}`, payload),
    'Create MoMo payment'
  );
};

export const useCreateMomoPaymentForInvoice = () => {
  return useMutation({
    mutationFn: ({ invoiceId, payload }: { invoiceId: string; payload: MomoInvoicePayRequest }) =>
      createMomoPaymentForInvoice(invoiceId, payload),
  });
};

const confirmMomoPayment = async (payload: Record<string, string>): Promise<Record<string, unknown>> => {
  return requestWithContext(clientHttp.post('/payment/momo/confirm', payload), 'Confirm MoMo payment');
};

export const useConfirmMomoPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, string>) => confirmMomoPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['userSubscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
