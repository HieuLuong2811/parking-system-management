import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';
import type { RoleRecord } from './types';

const fetchRoles = () => httpGet<RoleRecord[]>('/roles');

export const useAdminRoles = () => {
  return useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: fetchRoles,
    staleTime: 1000 * 60,
    retry: false,
  });
};
