import { useQuery } from "@tanstack/react-query";

import { clientHttp, PaginatedResponse, requestWithContext } from "./clientApi";

export type PaymentTransactionDetail = {
  payment_transaction_id: string;
  invoice_id?: string | null;
  subscription_id?: string | null;
  attempt_number?: number | null;
  transaction_code?: string | null;
  response_message?: string | null;
  transaction_type: string;
  payment_method: string;
  amount: number | string;
  status: string;
  balance_before?: number | string | null;
  balance_after?: number | string | null;
  description?: string | null;
  created_at: string;

  user_code: string;
  user_full_name?: string | null;

  invoice_amount?: number | null;
  invoice_payment_method?: string | null;
  invoice_status?: string | null;
  invoice_created_at?: string | null;
};

export type PaymentTransactionsMeQuery = {
  page: number;
  limit: number;
  transaction_type?: string;
  direction?: string;
  from_time?: string;
  to_time?: string;
};

const fetchMyPaymentTransactions = async (
  params: PaymentTransactionsMeQuery
): Promise<PaginatedResponse<PaymentTransactionDetail>> => {
  return requestWithContext(
    clientHttp.get<PaginatedResponse<PaymentTransactionDetail>>(
      "/payment_transactions/me/details",
      { params }
    ),
    "Load payment transactions"
  );
};

export const useMyPaymentTransactionsPaginated = (
  params: PaymentTransactionsMeQuery
) => {
  return useQuery({
    queryKey: ["paymentTransactions", "me", "paginated", params],
    queryFn: () => fetchMyPaymentTransactions(params),
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev,
  });
};
