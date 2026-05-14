import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { clientHttp, requestWithContext } from './clientApi';

export type WalletStatus = 'ACTIVE' | 'LOCKED';

export type UserWallet = {
  wallet_id: string;
  user_code: string;
  balance: string | number;
  currency: string;
  status: WalletStatus;
  created_at: string;
  updated_at: string;
};

export type WalletTopupRequest = {
  amount: number;
  redirect_url?: string;
  lang?: string;
};

export type WalletTopupResponse = {
  payUrl?: string;
  deeplink?: string;
  shortLink?: string;
  qrCodeUrl?: string;
  redirectUrl?: string;
  message?: string;
  [key: string]: unknown;
};

const getMyWallet = async (): Promise<UserWallet> => {
  return requestWithContext(clientHttp.get('/wallets/me'), 'Get my wallet');
};

export const useMyWallet = () => {
  return useQuery({
    queryKey: ['wallet', 'me'],
    queryFn: getMyWallet,
  });
};

const topupWallet = async (payload: WalletTopupRequest): Promise<WalletTopupResponse> => {
  return requestWithContext(clientHttp.post('/wallets/topup', payload), 'Wallet topup');
};

export const useWalletTopup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: topupWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['paymentTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

