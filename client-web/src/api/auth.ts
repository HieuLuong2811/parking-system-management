import { clientHttp, requestWithContext } from './clientApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const exchangeAuthCode = async (code: string): Promise<void> => {
  await clientHttp.post('/auth/exchange-code', { code });
};

const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  return requestWithContext(
    clientHttp.post('/auth/change-password', payload),
    'Change password'
  );
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSubscriptions'] });
    },
  });
};
