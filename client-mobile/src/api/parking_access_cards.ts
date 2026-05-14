import { useQuery } from '@tanstack/react-query';

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
  issued_at?: string | null;
  returned_at?: string | null;
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

