import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { clientHttp, requestWithContext } from "./clientApi";

export type WalletStatus = "ACTIVE" | "LOCKED";

export type UserWallet = {
  wallet_id: string;
  user_code: string;
  balance: string | number;
  currency: string;
  status: WalletStatus;
  created_at: string;
  updated_at: string;
};

export const useMyWallet = () => {
  return useQuery({
    queryKey: ["wallet", "me"],
    queryFn: () =>
      requestWithContext(clientHttp.get<UserWallet>("/wallets/me"), "Load wallet"),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
};

export type WalletTopUpRequest = {
  amount: number;
  redirect_url?: string;
  description?: string;
};

export type WalletTopUpResponse = {
  payment_transaction_id: string;
  order_id: string;
  pay_url?: string | null;
  short_link?: string | null;
  qr_code_url?: string | null;
};

export const useWalletTopUp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WalletTopUpRequest) =>
      requestWithContext(
        clientHttp.post<WalletTopUpResponse>("/wallets/topup", payload),
        "Wallet top-up",
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet", "me"] });
    },
  });
};

