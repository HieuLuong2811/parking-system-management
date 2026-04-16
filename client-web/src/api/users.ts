import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  clientHttp,
  requestWithContext,
  UserInfo,
  UserCreatePayload,
  UserUpdatePayload,
} from './clientApi';

const fetchUsers = async (): Promise<UserInfo[]> => {
  return requestWithContext(clientHttp.get<UserInfo[]>('/users'), 'Load users');
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5,
  });
};

const createUser = async (payload: UserCreatePayload): Promise<UserInfo> => {
  return requestWithContext(
    clientHttp.post<UserInfo>('/users', payload),
    'Create user'
  );
};

type UpdateUserVariables = {
  userCode: string;
  payload: UserUpdatePayload;
  skipInvalidate?: boolean;
};

const updateUser = async (userCode: string, payload: UserUpdatePayload): Promise<UserInfo> => {
  return requestWithContext(
    clientHttp.patch<UserInfo>(`/users/${userCode}`, payload),
    'Update user'
  );
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserCreatePayload) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userCode, payload }: UpdateUserVariables) => updateUser(userCode, payload),
    onSuccess: (_data, variables) => {
      if (!variables?.skipInvalidate) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
      }
    },
  });
};
