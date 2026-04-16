import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { httpDelete, httpGet, httpPost } from './httpClient';
import type { UserRoleRecord } from './types';

const fetchUserRoles = () => httpGet<UserRoleRecord[]>('/user_roles');

export const useAdminUserRoles = () => {
  return useQuery({
    queryKey: ['admin', 'userRoles'],
    queryFn: fetchUserRoles,
    staleTime: 1000 * 60,
    retry: false,
  });
};

const assignUserRole = (payload: { user_code: string; role_id: string }) =>
  httpPost<UserRoleRecord>('/user_roles', payload);

export const useAssignUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignUserRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
};

const revokeUserRole = (payload: { user_code: string; role_id: string }) =>
  httpDelete(`/user_roles/${payload.user_code}/${payload.role_id}`);

export const useRevokeUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeUserRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
};
