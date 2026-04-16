import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientHttp, requestWithContext } from './clientApi';

export interface SetupIntentResponse {
  client_secret: string;
  customer_id: string;
}

export interface StripePaymentIntentPayload {
  payment_method_id: string;
  amount: number;
  sub_plan_id: string;
  term_id: string;
  vehicle_id: string;
  payment_plan_id: string;
  start_date: string;
  end_date: string;
  total_amount?: number;
}

export interface StripePaymentIntentResponse {
  invoice_id: string;
  subscription_id: string;
  payment_intent_id: string;
  status: string;
}

export const createSetupIntent = async (): Promise<SetupIntentResponse> => {
  return requestWithContext(
    clientHttp.get<SetupIntentResponse>('/stripe/setup-intent'),
    'Create Stripe setup intent'
  );
};

export const attachPaymentMethod = async (paymentMethodId: string): Promise<{ payment_method_id: string }> => {
  return requestWithContext(
    clientHttp.post('/stripe/payment-method', { payment_method_id: paymentMethodId }),
    'Save payment method'
  );
};

export const useAttachPaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { payment_method_id: string }) => attachPaymentMethod(payload.payment_method_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSubscriptions'] });
    },
  });
};

export const createStripePaymentIntent = async (
  payload: StripePaymentIntentPayload
): Promise<StripePaymentIntentResponse> => {
  return requestWithContext(
    clientHttp.post<StripePaymentIntentResponse>('/stripe/payment-intents', payload),
    'Create Stripe payment intent'
  );
};
