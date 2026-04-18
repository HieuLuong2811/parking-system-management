import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { httpDelete, httpGet, httpPatch, httpPost } from './httpClient';
import type { AdminUser, PaginatedResponse, UserWithRoles } from './types';

export type UserCreatePayload = {
  user_code: string;
  full_name: string;
  email: string;
  password: string;
  language_use?: string;
};

export type UserUpdatePayload = {
  full_name?: string;
  email?: string;
  password?: string;
  language_use?: string;
};

export type UserListFilters = {
  search?: string;
  phone?: string;
  role?: string;
  is_deleted?: boolean;
  page?: number;
  limit?: number;
};

const fetchUsers = (filters: UserListFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.phone) params.append('phone', filters.phone);
  if (filters.role) params.append('role', filters.role);
  if (filters.is_deleted !== undefined) params.append('is_deleted', String(filters.is_deleted));
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  const query = params.toString();
  return httpGet<PaginatedResponse<UserWithRoles>>(`/users${query ? `?${query}` : ''}`);
};

export const useFetchUsers = (filters: UserListFilters = {}) => {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 1000 * 30,
    placeholderData: (previousData) => previousData,
  });
};

const createUser = (payload: UserCreatePayload) => httpPost<AdminUser>('/users', payload);

const updateUser = (userCode: string, payload: UserUpdatePayload) =>
  httpPatch<AdminUser>(`/users/${userCode}`, payload);

const deleteUser = (userCode: string) => httpDelete(`/users/${userCode}`);

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserCreatePayload) => createUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'], exact: false }),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userCode, payload }: { userCode: string; payload: UserUpdatePayload }) =>
      updateUser(userCode, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'], exact: false }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userCode: string) => deleteUser(userCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'], exact: false }),
  });
};
