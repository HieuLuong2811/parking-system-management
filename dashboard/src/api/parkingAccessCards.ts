import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpGet, httpPatch, httpPost } from './httpClient';
import type { HolderType, PaginatedResponse, ParkingAccessCardAdminRow, ParkingAccessCardStatus } from './types';

export type ParkingAccessCardFilters = {
  page?: number;
  limit?: number;
  barcode_token?: string;
  holder_type?: HolderType;
  status?: ParkingAccessCardStatus;
  user_query?: string;
  in_use?: boolean;
};

const fetchParkingAccessCardsPaginated = (filters: ParkingAccessCardFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.barcode_token) params.append('barcode_token', filters.barcode_token);
  if (filters.holder_type) params.append('holder_type', filters.holder_type);
  if (filters.status) params.append('status', filters.status);
  if (filters.user_query) params.append('user_query', filters.user_query);

  const query = params.toString();
  return httpGet<PaginatedResponse<ParkingAccessCardAdminRow>>(`/parking_access_cards${query ? `?${query}` : ''}`);
};

export const useParkingAccessCardsPaginated = (filters: ParkingAccessCardFilters = {}) => {
  return useQuery({
    queryKey: ['admin', 'parkingAccessCards', filters],
    queryFn: () => fetchParkingAccessCardsPaginated(filters),
    staleTime: 1000 * 60,
    retry: false,
    placeholderData: (previousData) => previousData,
  });
};

export type ParkingAccessCardCreatePayload = {
  barcode_token: string;
  holder_type: HolderType;
  user_code?: string;
};

const createParkingAccessCard = (payload: ParkingAccessCardCreatePayload) =>
  httpPost(`/parking_access_cards/`, payload);

export const useCreateParkingAccessCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ParkingAccessCardCreatePayload) => createParkingAccessCard(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'parkingAccessCards'], exact: false }),
  });
};

const disableParkingAccessCard = (cardId: string) =>
  httpPatch(`/parking_access_cards/${encodeURIComponent(cardId)}/disable`, {});

export const useDisableParkingAccessCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => disableParkingAccessCard(cardId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'parkingAccessCards'], exact: false }),
  });
};
