import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';
import type { UserRoleRecord } from './types';

const fetchUserRoles = () => httpGet<UserRoleRecord[]>('/user_roles');

export const useAdminUserRoles = () => {
  return useQuery({
    queryKey: ['admin', 'userRoles'],
    queryFn: fetchUserRoles,
    staleTime: 1000 * 60,
    retry: false,
  });
};
