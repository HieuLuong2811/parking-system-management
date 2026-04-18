import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';
import { fetchAllPaginated } from './paginated';
import type {
  AdminUser,
  PaymentPlanRecord,
  SubscriptionPlanRecord,
  SubscriptionSearchRow,
  UserSubscriptionDetailRecord,
  UserSubscriptionRecord,
  UserWithRoles,
  VehicleRecord,
} from './types';

export type SubscriptionSearchFilters = {
  query?: string;
  status?: string;
};

const fetchSubscriptions = () => httpGet<UserSubscriptionRecord[]>('/subscriptions');
const fetchUsers = () => fetchAllPaginated<UserWithRoles>('/users');
const fetchVehicles = () => fetchAllPaginated<VehicleRecord>('/vehicles');
const fetchPaymentPlans = () => httpGet<PaymentPlanRecord[]>('/payment_plans');
const fetchSubscriptionPlans = () => httpGet<SubscriptionPlanRecord[]>('/subscription_plans');

export const useSubscriptionSearch = (filters: SubscriptionSearchFilters = {}) => {
  const subscriptionsQuery = useQuery({
    queryKey: ['admin', 'subscriptions'],
    queryFn: fetchSubscriptions,
    staleTime: 1000 * 60,
  });
  const usersQuery = useQuery<UserWithRoles[]>({
    queryKey: ['admin', 'users'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60,
  });
  const vehiclesQuery = useQuery({
    queryKey: ['admin', 'vehicles'],
    queryFn: fetchVehicles,
    staleTime: 1000 * 60,
  });
  const paymentPlansQuery = useQuery({
    queryKey: ['admin', 'paymentPlans'],
    queryFn: fetchPaymentPlans,
    staleTime: 1000 * 60,
  });
  const subscriptionPlansQuery = useQuery({
    queryKey: ['admin', 'subscriptionPlans'],
    queryFn: fetchSubscriptionPlans,
    staleTime: 1000 * 60,
  });

  const baseRows = useMemo<UserSubscriptionRecord[]>(() => (subscriptionsQuery.data as UserSubscriptionRecord[]) ?? [], [subscriptionsQuery.data]);
  const vehicles = useMemo<VehicleRecord[]>(() => (vehiclesQuery.data as VehicleRecord[]) ?? [], [vehiclesQuery.data]);
  const paymentPlans = useMemo<PaymentPlanRecord[]>(() => (paymentPlansQuery.data as PaymentPlanRecord[]) ?? [], [paymentPlansQuery.data]);
  const subscriptionPlans = useMemo<SubscriptionPlanRecord[]>(() => (subscriptionPlansQuery.data as SubscriptionPlanRecord[]) ?? [], [subscriptionPlansQuery.data]);

  const users = useMemo<AdminUser[]>(() => {
    if (!usersQuery.data || !Array.isArray(usersQuery.data)) {
      return [];
    }
    return usersQuery.data
      .map((item) => item?.user)
      .filter((user): user is AdminUser => !!user);
  }, [usersQuery.data]);

  const joined = useMemo<SubscriptionSearchRow[]>(() => {

    return baseRows.map((row) => {
      const foundUser = users.find((user) => 
        String(user.user_code) === String(row.user_code)
      );
      console.log("🚀 ~ useSubscriptionSearch ~ foundUser:", foundUser)

      return {
        ...row,
        user: foundUser,
        vehicle: vehicles.find((v) => v.id === row.vehicle_id),
        payment_plan: paymentPlans.find((p) => p.id === row.payment_plan_id),
        plan: subscriptionPlans.find((p) => p.id === row.sub_plan_id),
      };
    });
  }, [baseRows, users, vehicles, paymentPlans, subscriptionPlans]);

  const filtered = useMemo(() => {
    const query = filters.query?.trim().toLowerCase();
    return joined.filter((row) => {
      if (filters.status && row.status !== filters.status) return false;
      if (!query) return true;
      const haystack = [
        row.user_code,
        row.vehicle_id,
        row.sub_plan_id,
        row.payment_plan_id,
        row.user?.full_name,
        row.user?.email,
        row.vehicle?.license_plate,
        row.plan?.plan_name,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase())
        .join('|');
      return haystack.includes(query);
    });
  }, [filters.query, filters.status, joined]);

  const isLoading =
    subscriptionsQuery.isLoading ||
    usersQuery.isLoading ||
    vehiclesQuery.isLoading ||
    paymentPlansQuery.isLoading ||
    subscriptionPlansQuery.isLoading;
  const isError =
    subscriptionsQuery.isError ||
    usersQuery.isError ||
    vehiclesQuery.isError ||
    paymentPlansQuery.isError ||
    subscriptionPlansQuery.isError;

  return {
    data: filtered,
    raw: joined,
    isLoading,
    isError,
    refetch: () => Promise.all([
      subscriptionsQuery.refetch(),
      usersQuery.refetch(),
      vehiclesQuery.refetch(),
      paymentPlansQuery.refetch(),
      subscriptionPlansQuery.refetch(),
    ]),
  };
};

const fetchSubscriptionDetails = () => httpGet<UserSubscriptionDetailRecord[]>('/subscriptions/details');

export const useSubscriptionDetails = () => {
  const query = useQuery({
    queryKey: ['admin', 'subscriptionDetails'],
    queryFn: fetchSubscriptionDetails,
    staleTime: 1000 * 60,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
