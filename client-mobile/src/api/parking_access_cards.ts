import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { clientHttp, requestWithContext } from './clientApi';

export type ParkingAccessCardStatus = 'AVAILABLE' | 'ASSIGNED' | 'ACTIVE' | 'DISABLED' | 'LOST';
export type ParkingAccessCardHolderType = 'STUDENT' | 'TEACHER' | 'GUEST';

export type ParkingAccessCard = {
  id: string;
  barcode_token: string;
  holder_type: ParkingAccessCardHolderType;
  user_code?: string | null;
  user_subscription_id?: string | null;
  status: ParkingAccessCardStatus;
  created_at: string;
  updated_at: string;
};

const getMyParkingAccessCard = async (): Promise<ParkingAccessCard> => {
  return requestWithContext(clientHttp.get('/parking_access_cards/me'), 'Get my parking access card');
};

export const useMyParkingAccessCard = () => {
  return useQuery({
    queryKey: ['parkingAccessCard', 'me'],
    queryFn: getMyParkingAccessCard,
  });
};

const reportLostParkingAccessCard = async (
  cardId: string,
): Promise<ParkingAccessCard> => {
  return requestWithContext(
    clientHttp.patch(`/parking_access_cards/${cardId}/report_lost`),
    `Report parking access card ${cardId} lost`,
  );
};

export const useReportMyParkingAccessCardLost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardId: string) => reportLostParkingAccessCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parkingAccessCard', 'me'] });
    },
  });
};