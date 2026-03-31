import { useQuery } from '@tanstack/react-query';

import { clientHttp, requestWithContext, InvoiceInfo } from './clientApi';
import { isMockMode, mockInvoices } from '../mocks/mockData';

const fetchInvoices = async (): Promise<InvoiceInfo[]> => {
  if (isMockMode) {
    return Promise.resolve(mockInvoices);
  }
  return requestWithContext(clientHttp.get<InvoiceInfo[]>('/invoices'), 'Load invoices');
};

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
    staleTime: 1000 * 60,
  });
};
