import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { httpDelete, httpGet, httpPatch, httpPost } from './httpClient';
import type { AdminUser, UserWithRoles } from './types';

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
};

const fetchUsers = (filters: UserListFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.phone) params.append('phone', filters.phone);
  if (filters.role) params.append('role', filters.role);
  if (filters.is_deleted !== undefined) params.append('is_deleted', String(filters.is_deleted));
  const query = params.toString();
  return httpGet<UserWithRoles[]>(`/users${query ? `?${query}` : ''}`);
};

export const useFetchUsers = (filters: UserListFilters = {}) => {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 1000 * 60,
    retry: false,
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
