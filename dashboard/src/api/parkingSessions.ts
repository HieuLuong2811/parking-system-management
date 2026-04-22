import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';
import type { PaginatedResponse, ParkingSessionAdminRow } from './types';

export type ParkingSessionsQuery = {
  page: number;
  limit: number;
  query?: string;
  user_code?: string;
  vehicle_type?: string;
  status?: 'ACTIVE' | 'DONE';
  from_time?: string;
  to_time?: string;
};

const fetchParkingSessionsPaginated = async (params: ParkingSessionsQuery) => {
  const search = new URLSearchParams();
  if (params.query) search.append('query', params.query);
  if (params.user_code) search.append('user_code', params.user_code);
  if (params.vehicle_type) search.append('vehicle_type', params.vehicle_type);
  if (params.status) search.append('status', params.status);
  if (params.from_time) search.append('from_time', params.from_time);
  if (params.to_time) search.append('to_time', params.to_time);
  search.append('page', String(params.page));
  search.append('limit', String(params.limit));

  const query = search.toString();
  return httpGet<PaginatedResponse<ParkingSessionAdminRow>>(
    `/parking_sessions${query ? `?${query}` : ''}`
  );
};

export const useParkingSessionsPaginated = (params: ParkingSessionsQuery) => {
  return useQuery({
    queryKey: ['admin', 'parkingSessions', 'paginated', params],
    queryFn: () => fetchParkingSessionsPaginated(params),
    staleTime: 1000 * 15,
    placeholderData: (previous) => previous,
  });
};
