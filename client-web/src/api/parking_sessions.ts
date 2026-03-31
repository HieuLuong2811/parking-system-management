import { useQuery } from '@tanstack/react-query';

import { clientHttp, requestWithContext, ParkingSession } from './clientApi';
import { isMockMode, mockParkingSessions } from '../mocks/mockData';

const fetchParkingSessions = async (): Promise<ParkingSession[]> => {
  if (isMockMode) {
    return Promise.resolve(mockParkingSessions);
  }
  return requestWithContext(
    clientHttp.get<ParkingSession[]>('/parking_sessions'),
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
