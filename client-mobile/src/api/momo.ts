import { useMutation, useQueryClient } from '@tanstack/react-query';
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

export interface CheckoutPayDebtRequest {
  invoice_id: string;
  redirect_url?: string;
}

const createMomoPayment = async (payload: MomoPaymentPayload): Promise<MomoPaymentResponse> => {
  return requestWithContext(clientHttp.post<MomoPaymentResponse>('/payment/momo', payload), 'Create MoMo payment');
};

export const useCreateMomoPayment = () => {
  return useMutation({
    mutationFn: (payload: MomoPaymentPayload) => createMomoPayment(payload),
  });
};

export const useCheckoutRecurring = () => {
  return useMutation({
    mutationFn: (payload: any) =>
      requestWithContext(
        clientHttp.post("/checkout/recurring", payload),
        "Checkout recurring"
      ),
  });
};

const checkoutPayDebt = async (
  payload: CheckoutPayDebtRequest
): Promise<MomoPaymentResponse> => {
  return requestWithContext(
    clientHttp.post("/checkout/pay-debt", payload),
    "Checkout pay debt"
  );
};

export const useCheckoutPayDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkoutPayDebt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
