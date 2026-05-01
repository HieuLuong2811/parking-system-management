import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';
import type { PaginatedResponse, VehicleRecord } from './types';

export type VehicleListFilters = {
  user_code?: string;
  search?: string;
  is_deleted?: boolean;
  page?: number;
  limit?: number;
};

const fetchVehicles = (filters: VehicleListFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.user_code) params.append('user_code', filters.user_code);
  if (filters.search) params.append('search', filters.search);
  if (filters.is_deleted !== undefined) params.append('is_deleted', String(filters.is_deleted));
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  const query = params.toString();
  return httpGet<PaginatedResponse<VehicleRecord>>(`/vehicles${query ? `?${query}` : ''}`);
};

export const useVehicles = (filters: VehicleListFilters = {}) => {
  return useQuery({
    queryKey: ['admin', 'vehicles', filters],
    queryFn: () => fetchVehicles(filters),
    staleTime: 1000 * 60,
    retry: false,
    placeholderData: (previousData) => previousData,
  });
};
