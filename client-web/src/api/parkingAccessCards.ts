import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { clientHttp, requestWithContext } from './clientApi';

export type ParkingAccessCardStatus = 'ACTIVE' | 'DISABLED' | 'LOST';

export type ParkingAccessCard = {
  id: string;
  barcode_token: string;
  status: ParkingAccessCardStatus;
  holder_type?: string;
  created_at?: string;
};

export const useMyParkingAccessCards = () => {
  return useQuery({
    queryKey: ['me', 'parkingAccessCards'],
    queryFn: () =>
      requestWithContext(
        clientHttp.get<ParkingAccessCard[]>('/me/parking-access-cards'),
        'Load parking cards'
      ),
    staleTime: 1000 * 30,
    retry: false,
  });
};

export const useActivateParkingAccessCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) =>
      requestWithContext(
        clientHttp.patch(`/parking-access-cards/${encodeURIComponent(cardId)}/activate`, {}),
        'Activate card'
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me', 'parkingAccessCards'], exact: false }),
  });
};

export const useReportLostParkingAccessCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) =>
      requestWithContext(
        clientHttp.patch(`/parking-access-cards/${encodeURIComponent(cardId)}/report-lost`, {}),
        'Report lost'
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me', 'parkingAccessCards'], exact: false }),
  });
};

