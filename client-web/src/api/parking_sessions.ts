import { useQuery } from '@tanstack/react-query';

import { clientHttp, requestWithContext, ParkingSession } from './clientApi';

const fetchParkingSessions = async (): Promise<ParkingSession[]> => {
  return requestWithContext(
    clientHttp.get<ParkingSession[]>('/parking_sessions/me'),
    'Load parking sessions'
  );
};

export const useParkingSessions = () => {
  return useQuery({
    queryKey: ['parkingSessions'],
    queryFn: fetchParkingSessions,
    staleTime: 1000 * 60,
  });
};
