import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';
import { fetchAllPaginated } from './paginated';
import type { AdminUser, InvoiceAdminRecord, InvoiceSearchRow, UserWithRoles } from './types';

export type InvoiceSearchFilters = {
  query?: string;
  status?: string;
  subscriptionId?: string;
};

const fetchInvoices = () => httpGet<InvoiceAdminRecord[]>('/invoices');
const fetchUsers = async () => {
  const usersWithRoles = await fetchAllPaginated<UserWithRoles>('/users');
  return usersWithRoles.map((item) => item.user).filter(Boolean) as AdminUser[];
};

export const useInvoiceSearch = (filters: InvoiceSearchFilters = {}) => {
  const invoicesQuery = useQuery({
    queryKey: ['admin', 'invoices'],
    queryFn: fetchInvoices,
    staleTime: 1000 * 60,
  });
  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60,
  });

  const data = useMemo<InvoiceSearchRow[]>(() => {
    const invoices = invoicesQuery.data ?? [];
    const users = usersQuery.data ?? [];
    return invoices.map((invoice) => ({
      ...invoice,
      user: users.find((user) => user.user_code === invoice.user_code),
    }));
  }, [invoicesQuery.data, usersQuery.data]);

  const filtered = useMemo(() => {
    const query = filters.query?.trim().toLowerCase();
    return data.filter((row) => {
      if (filters.subscriptionId && row.subscription_id !== filters.subscriptionId) return false;
      if (filters.status && row.status !== filters.status) return false;
      if (!query) return true;
      return (
        row.id.toLowerCase().includes(query) ||
        row.user_code.toLowerCase().includes(query) ||
        !!row.user?.full_name?.toLowerCase().includes(query)
      );
    });
  }, [data, filters.query, filters.status, filters.subscriptionId]);

  return {
    data: filtered,
    raw: data,
    isLoading: invoicesQuery.isLoading || usersQuery.isLoading,
    isError: invoicesQuery.isError || usersQuery.isError,
    refetch: () => Promise.all([invoicesQuery.refetch(), usersQuery.refetch()]),
  };
};

export const useInvoices = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
    staleTime: 1000 * 60,
  });

  return { data, isLoading, isError, error };
};
