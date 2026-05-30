import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { httpGet, httpPatch, httpPost } from './httpClient';

export type MyProfile = {
  user_code: string;
  full_name: string;
  email?: string | null;
  phone_number?: string | null;
  language_use?: string | null;
};

export type UpdateMyProfilePayload = {
  full_name?: string;
  email?: string;
  phone_number?: string;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

export const useMyProfile = (userCode?: string) => {
  return useQuery({
    queryKey: ['admin', 'profile', userCode],
    queryFn: () => httpGet<MyProfile>(`/users/${userCode}`),
    enabled: !!userCode,
  });
};

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userCode, payload }: { userCode: string; payload: UpdateMyProfilePayload }) =>
      httpPatch<MyProfile>(`/users/${userCode}`, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'profile', variables.userCode] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'], exact: false });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => httpPost<{ detail: string }>('/auth/change-password', payload),
  });
};

