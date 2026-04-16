import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';
import type { VehicleRecord } from './types';

const fetchVehicles = () => httpGet<VehicleRecord[]>('/vehicles');

export const useVehicles = () => {
  return useQuery({
    queryKey: ['admin', 'vehicles'],
    queryFn: fetchVehicles,
    staleTime: 1000 * 60,
    retry: false,
  });
};
