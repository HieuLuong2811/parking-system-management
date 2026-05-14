import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientHttp, requestWithContext } from "./clientApi";

export interface CheckoutMomoRequest {
  sub_plan_id: string;
  term_id: string;
  payment_plan_id: string;
  start_date: string;
  end_date: string;
  amount: number;
  redirect_url?: string;
  lang?: string;
}

export type MomoCreateResponse = {
  payUrl?: string;
  deeplink?: string;
  shortLink?: string;
  [key: string]: unknown;
};

export interface CheckoutPayDebtRequest {
  invoice_id: string;
  redirect_url?: string;
}

const checkoutMomo = async (
  payload: CheckoutMomoRequest
): Promise<MomoCreateResponse> => {
  return requestWithContext(
    clientHttp.post("/checkout/momo", payload),
    "Checkout MoMo"
  );
};

export const useCheckoutMomo = () => {
  return useMutation({
    mutationFn: checkoutMomo,
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
): Promise<MomoCreateResponse> => {
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
