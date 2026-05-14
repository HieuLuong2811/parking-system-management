import { useMutation } from "@tanstack/react-query";

import { clientHttp, requestWithContext } from "./clientApi";

export type CheckoutWalletFullRequest = {
  sub_plan_id: string;
  term_id: string;
  payment_plan_id: string;
  start_date: string;
  end_date: string;
  amount: number;
};

export type CheckoutWalletFullResponse = {
  subscription_id: string;
  invoice_id: string;
  payment_transaction_id: string;
  wallet_balance_after: string;
  status: string;
};

export const useCheckoutWalletFull = () => {
  return useMutation({
    mutationFn: (payload: CheckoutWalletFullRequest) =>
      requestWithContext(
        clientHttp.post<CheckoutWalletFullResponse>("/checkout/wallet-full", payload),
        "Checkout wallet full",
      ),
  });
};

