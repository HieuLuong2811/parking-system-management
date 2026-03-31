import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';
import type { BillingEventLogRecord } from './types';

const fetchBillingEvents = () => httpGet<BillingEventLogRecord[]>('/billing_event_logs');

export const useBillingEvents = () => {
  return useQuery({
    queryKey: ['admin', 'billingEvents'],
    queryFn: fetchBillingEvents,
    staleTime: 1000 * 60,
    retry: false,
  });
};
