import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { httpDelete, httpGet, httpPatch, httpPost } from './httpClient';
import type { AdminUser } from './types';

export type UserCreatePayload = {
  user_code: string;
  full_name: string;
  email: string;
  password: string;
  language_use?: string;
  is_active?: boolean;
};

export type UserUpdatePayload = {
  full_name?: string;
  email?: string;
  password?: string;
  language_use?: string;
  is_active?: boolean;
};

const fetchUsers = () => httpGet<AdminUser[]>('/users');

export const useFetchUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchUsers,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userCode, payload }: { userCode: string; payload: UserUpdatePayload }) =>
      updateUser(userCode, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userCode: string) => deleteUser(userCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
};
