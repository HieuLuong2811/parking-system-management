import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { httpDelete, httpGet, httpPatch, httpPost } from './httpClient';
import type { SubscriptionPlanRecord } from './types';

export type SubscriptionPlanCreatePayload = {
  plan_name: string;
  price_per_day: number;
  description?: string;
};

export type SubscriptionPlanUpdatePayload = Partial<SubscriptionPlanCreatePayload & { deleted_at?: string | null }>;

const fetchSubscriptionPlans = () => httpGet<SubscriptionPlanRecord[]>('/plans');

export const useAdminSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['admin', 'subscriptionPlans'],
    queryFn: fetchSubscriptionPlans,
    staleTime: 1000 * 60,
    retry: false,
  });
};

const createSubscriptionPlan = (payload: SubscriptionPlanCreatePayload) =>
  httpPost<SubscriptionPlanRecord>('/plans', payload);

const updateSubscriptionPlan = (id: string, payload: SubscriptionPlanUpdatePayload) =>
  httpPatch<SubscriptionPlanRecord>(`/plans/${id}`, payload);

const deleteSubscriptionPlan = (id: string) => httpDelete(`/plans/${id}`);

export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubscriptionPlanCreatePayload) => createSubscriptionPlan(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptionPlans'] }),
  });
};

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SubscriptionPlanUpdatePayload }) =>
      updateSubscriptionPlan(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptionPlans'] }),
  });
};

export const useDeleteSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSubscriptionPlan(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptionPlans'] }),
  });
};
