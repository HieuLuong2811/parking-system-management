import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';

export type DashboardSummary = {
  vehicles_in_parking: number;
  today_checkins: number;
  today_checkouts: number;
  today_revenue: number;
  monthly_revenue: number;
  pending_invoices: number;
  active_subscription_users: number;
  expiring_subscriptions: number;

  // backward-compatible (optional)
  total_users?: number;
  registered_users?: number;
  unregistered_users?: number;
  registration_rate?: number;
  active_subscriptions?: number;
  today_sessions?: number;
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type MonthlySubscriptionPoint = {
  month: string;
  new_subscriptions: number;
};

export type MonthlyRevenuePoint = {
  month: string;
  revenue: number;
};

export type MonthlyParkingSessionPoint = {
  month: string;
  sessions: number;
};

export type StatusDistributionPoint = {
  status: string;
  count: number;
};

export type DashboardCharts = {
  subscription_adoption: ChartPoint[];
  monthly_subscriptions: MonthlySubscriptionPoint[];
  monthly_revenue: MonthlyRevenuePoint[];
  monthly_parking_sessions: MonthlyParkingSessionPoint[];
  invoice_status_distribution: StatusDistributionPoint[];
  subscription_status_distribution: StatusDistributionPoint[];
};

export type RecentInvoiceItem = {
  id: string;
  user_code?: string | null;
  user_full_name?: string | null;
  amount: number;
  status: string;
  payment_method?: string | null;
  created_at: string;
};

export type RecentParkingSessionItem = {
  id: string;
  user_code?: string | null;
  user_full_name?: string | null;
  license_plate?: string | null;
  status: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
};

export type DashboardRecent = {
  invoices: RecentInvoiceItem[];
  sessions: RecentParkingSessionItem[];
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'summary'],
    queryFn: () => httpGet<DashboardSummary>('/statistics/summary'),
    staleTime: 1000 * 30,
  });
};

export const useDashboardCharts = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'charts'],
    queryFn: () => httpGet<DashboardCharts>('/statistics/charts'),
    staleTime: 1000 * 60,
  });
};

export const useDashboardRecent = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'recent'],
    queryFn: () => httpGet<DashboardRecent>('/statistics/recent'),
    staleTime: 1000 * 20,
  });
};
