import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';
import type { ParkingSessionRecord } from './types';

export type ParkingSessionFilters = {
  query?: string;
  status?: 'ACTIVE' | 'DONE';
};

const fetchParkingSessions = () => httpGet<ParkingSessionRecord[]>('/parking_sessions');

export const useParkingSessionSearch = (filters: ParkingSessionFilters = {}) => {
  const sessionsQuery = useQuery({
    queryKey: ['admin', 'parkingSessions'],
    queryFn: fetchParkingSessions,
    staleTime: 1000 * 60,
  });

  const data = useMemo(() => sessionsQuery.data ?? [], [sessionsQuery.data]);

  const filtered = useMemo(() => {
    const query = filters.query?.trim().toLowerCase();
    return data.filter((session) => {
      if (filters.status && session.status !== filters.status) {
        return false;
      }
      if (!query) return true;
      const haystack = [
        session.id,
        session.vehicle_id,
        session.license_plate,
        session.status,
        session.user_type,
      ]
        .filter(Boolean)
        .map((item) => String(item).toLowerCase())
        .join('|');
      return haystack.includes(query);
    });
  }, [data, filters.query, filters.status]);

  return {
    data: filtered,
    raw: data,
    isLoading: sessionsQuery.isLoading,
    isError: sessionsQuery.isError,
    refetch: () => sessionsQuery.refetch(),
  };
};
