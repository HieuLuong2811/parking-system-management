import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';
import type { PaymentTransactionRecord } from './types';

const fetchPaymentTransactions = () => httpGet<PaymentTransactionRecord[]>('/payment_transactions');

export const usePaymentTransactions = () => {
  return useQuery({
    queryKey: ['admin', 'paymentTransactions'],
    queryFn: fetchPaymentTransactions,
    staleTime: 1000 * 60,
    retry: false,
  });
};
