import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';
import type {
  AdminUser,
  PaymentPlanRecord,
  SubscriptionPlanRecord,
  SubscriptionSearchRow,
  UserSubscriptionRecord,
  VehicleRecord,
} from './types';
import {
  mockPaymentPlans,
  mockSubscriptionPlans,
  mockUserSubscriptions,
  mockUsers,
  mockVehicles,
} from '../mocks/mockSubscriptions';
import { REACT_APP_USE_MOCK_SUBSCRIPTIONS } from '../constant/config';

export type SubscriptionSearchFilters = {
  query?: string;
  status?: string;
};

const useMockData = REACT_APP_USE_MOCK_SUBSCRIPTIONS;
const resolveMock = <T>(value: T) => Promise.resolve(value);

const fetchSubscriptions = () => httpGet<UserSubscriptionRecord[]>('/subscriptions');
const fetchUsers = () => httpGet<AdminUser[]>('/users');
const fetchVehicles = () => httpGet<VehicleRecord[]>('/vehicles');
const fetchPaymentPlans = () => httpGet<PaymentPlanRecord[]>('/payment_plans');
const fetchSubscriptionPlans = () => httpGet<SubscriptionPlanRecord[]>('/subscription_plans');

export const useSubscriptionSearch = (filters: SubscriptionSearchFilters = {}) => {
  const subscriptionsQuery = useQuery({
    queryKey: ['admin', 'subscriptions'],
    queryFn: useMockData ? () => resolveMock(mockUserSubscriptions) : fetchSubscriptions,
    staleTime: 1000 * 60,
  });
  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: useMockData ? () => resolveMock(mockUsers) : fetchUsers,
    staleTime: 1000 * 60,
  });
  const vehiclesQuery = useQuery({
    queryKey: ['admin', 'vehicles'],
    queryFn: useMockData ? () => resolveMock(mockVehicles) : fetchVehicles,
    staleTime: 1000 * 60,
  });
  const paymentPlansQuery = useQuery({
    queryKey: ['admin', 'paymentPlans'],
    queryFn: useMockData ? () => resolveMock(mockPaymentPlans) : fetchPaymentPlans,
    staleTime: 1000 * 60,
  });
  const subscriptionPlansQuery = useQuery({
    queryKey: ['admin', 'subscriptionPlans'],
    queryFn: useMockData ? () => resolveMock(mockSubscriptionPlans) : fetchSubscriptionPlans,
    staleTime: 1000 * 60,
  });

  const baseRows = useMemo<UserSubscriptionRecord[]>(() => (subscriptionsQuery.data as UserSubscriptionRecord[]) ?? [], [subscriptionsQuery.data]);
  const users = useMemo<AdminUser[]>(() => (usersQuery.data as AdminUser[]) ?? [], [usersQuery.data]);
  const vehicles = useMemo<VehicleRecord[]>(() => (vehiclesQuery.data as VehicleRecord[]) ?? [], [vehiclesQuery.data]);
  const paymentPlans = useMemo<PaymentPlanRecord[]>(() => (paymentPlansQuery.data as PaymentPlanRecord[]) ?? [], [paymentPlansQuery.data]);
  const subscriptionPlans = useMemo<SubscriptionPlanRecord[]>(() => (subscriptionPlansQuery.data as SubscriptionPlanRecord[]) ?? [], [subscriptionPlansQuery.data]);

  const joined = useMemo<SubscriptionSearchRow[]>(() => {
    return baseRows.map((row) => ({
      ...row,
      user: users.find((user) => user.user_code === row.user_code),
      vehicle: vehicles.find((vehicle) => vehicle.id === row.vehicle_id),
      payment_plan: paymentPlans.find((plan) => plan.id === row.payment_plan_id),
      plan: subscriptionPlans.find((plan) => plan.id === row.sub_plan_id),
    })) as SubscriptionSearchRow[];
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
