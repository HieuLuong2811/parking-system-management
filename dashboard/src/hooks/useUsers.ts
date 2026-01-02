import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api/user';

const USER_QUERY_KEY = ['users'];

export const useUsers = () => {
  return useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: userApi.fetchUsers,
  });
};