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
  subscription_id: string;
  payment_intent_id: string;
  status: string;
}

export const createSetupIntent = async (): Promise<SetupIntentResponse> => {
  return requestWithContext(clientHttp.get<SetupIntentResponse>('/stripe/setup-intent'), 'Create Stripe setup intent');
};

export const createStripePaymentIntent = async (
  payload: StripePaymentIntentPayload
): Promise<StripePaymentIntentResponse> => {
  return requestWithContext(
    clientHttp.post<StripePaymentIntentResponse>('/stripe/payment-intents', payload),
    'Create Stripe payment intent'
  );
};
