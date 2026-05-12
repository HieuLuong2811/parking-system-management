import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  clientHttp,
  requestWithContext,
  UserInfo,
  UserUpdatePayload,
} from './clientApi';


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
