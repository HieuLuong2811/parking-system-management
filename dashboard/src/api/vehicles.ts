import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';
import type { PaginatedResponse, VehicleRecord } from './types';

export type VehicleListFilters = {
  user_code?: string;
  search?: string;
  license_plate?: string;
  vehicle_type?: string;
  barcode_token?: string;
  is_deleted?: boolean;
  page?: number;
  limit?: number;
};

const fetchVehicles = (filters: VehicleListFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.user_code) params.append('user_code', filters.user_code);
  if (filters.search) params.append('search', filters.search);
  if (filters.license_plate) params.append('license_plate', filters.license_plate);
  if (filters.vehicle_type) params.append('vehicle_type', filters.vehicle_type);
  if (filters.barcode_token) params.append('barcode_token', filters.barcode_token);
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
