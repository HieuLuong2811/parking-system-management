import { useQuery } from '@tanstack/react-query';

import { clientHttp, PaginatedResponse, ParkingSession, requestWithContext } from './clientApi';

export type ParkingSessionsMeQuery = {
  page: number;
  limit: number;
  from_time?: string;
  to_time?: string;
  vehicle_mode?: 'LICENSED' | 'UNLICENSED';
  license_plate?: string;
};

const fetchParkingSessions = async (params: ParkingSessionsMeQuery): Promise<PaginatedResponse<ParkingSession>> => {
  return requestWithContext(
    clientHttp.get<PaginatedResponse<ParkingSession>>('/parking_sessions/me', { params }),
    'Load parking sessions'
  );
};

export const useParkingSessions = (params: ParkingSessionsMeQuery) => {
  return useQuery({
    queryKey: ['parkingSessions', 'me', params],
    queryFn: () => fetchParkingSessions(params),
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev,
  });
};
