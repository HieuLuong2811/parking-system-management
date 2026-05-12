import { useQuery } from "@tanstack/react-query";

import { clientHttp, PaginatedResponse, requestWithContext } from "./clientApi";

export type PaymentTransactionDetail = {
  id: string;
  invoice_id: string;
  attempt_number: number;
  transaction_code: string;
  response_message: string;
  created_at: string;

  user_code: string;
  user_full_name: string;

  invoice_amount: number;
  invoice_payment_method: string;
  invoice_status: string;
  invoice_created_at: string;
};

export type PaymentTransactionsMeQuery = {
  page: number;
  limit: number;
  invoice_id?: string;
  transaction_code?: string;
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

