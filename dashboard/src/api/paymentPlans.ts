import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { httpDelete, httpGet, httpPatch, httpPost } from './httpClient';
import type { PaymentPlanRecord } from './types';

export type PaymentPlanCreatePayload = {
  plan_name: string;
  payment_type: 'FULL' | 'MONTHLY';
  discount_percent?: number;
  description?: string;
  is_active?: boolean;
};

export type PaymentPlanUpdatePayload = Partial<PaymentPlanCreatePayload>;

const fetchPaymentPlans = () => httpGet<PaymentPlanRecord[]>('/payment_plans');

export const useAdminPaymentPlans = () => {
  return useQuery({
    queryKey: ['admin', 'paymentPlans'],
    queryFn: fetchPaymentPlans,
    staleTime: 1000 * 60,
    retry: false,
  });
};

const createPaymentPlan = (payload: PaymentPlanCreatePayload) =>
  httpPost<PaymentPlanRecord>('/payment_plans', payload);

const updatePaymentPlan = (id: string, payload: PaymentPlanUpdatePayload) =>
  httpPatch<PaymentPlanRecord>(`/payment_plans/${id}`, payload);

const deletePaymentPlan = (id: string) => httpDelete(`/payment_plans/${id}`);

export const useCreatePaymentPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentPlanCreatePayload) => createPaymentPlan(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'paymentPlans'] }),
  });
};

export const useUpdatePaymentPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PaymentPlanUpdatePayload }) =>
      updatePaymentPlan(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'paymentPlans'] }),
  });
};

export const useDeletePaymentPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePaymentPlan(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'paymentPlans'] }),
  });
};
