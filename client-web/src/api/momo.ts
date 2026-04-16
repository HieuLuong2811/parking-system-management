import { useMutation } from '@tanstack/react-query';

import { clientHttp, requestWithContext } from './clientApi';

export interface MomoPaymentPayload {
  amount: number;
  orderId: string;
  orderInfo?: string;
  redirectUrl?: string;
  extraData?: string;
  lang?: string;
}

export interface MomoPaymentResponse {
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  redirectUrl?: string;
  message?: string;
  [key: string]: unknown;
}

const createMomoPayment = async (payload: MomoPaymentPayload): Promise<MomoPaymentResponse> => {
  return requestWithContext(
    clientHttp.post<MomoPaymentResponse>('/payment/momo', payload),
    'Create MoMo payment'
  );
};

export const useCreateMomoPayment = () => {
  return useMutation({
    mutationFn: (payload: MomoPaymentPayload) => createMomoPayment(payload),
  });
};
