import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { ApiRequestError, clientHttp, PaginatedResponse, requestWithContext, ParkingSession } from './clientApi';

export type ParkingSessionsMeQuery = {
  page: number;
  limit: number;
  status?: 'ACTIVE' | 'DONE';
  from_time?: string;
  to_time?: string;
};

const fetchParkingSessions = async (params: ParkingSessionsMeQuery): Promise<PaginatedResponse<ParkingSession>> => {
  return requestWithContext(
    clientHttp.get<PaginatedResponse<ParkingSession>>('/parking_sessions/me', { params }),
    'Load parking sessions'
  );
};

export const useParkingSessions = (params: ParkingSessionsMeQuery) => {
  return useQuery({
    queryKey: ['parkingSessions', 'me', params],
    queryFn: () => fetchParkingSessions(params),
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev,
  });
};

export type ParkingSessionsMeExportQuery = Omit<ParkingSessionsMeQuery, 'page' | 'limit'>;

export const exportMyParkingSessionsXlsx = async (
  params: ParkingSessionsMeExportQuery
): Promise<{ blob: Blob; filename: string }> => {
  try {
    const response = await clientHttp.get<Blob>('/parking_sessions/me/export', {
      params,
      responseType: 'blob',
    });

    const disposition = response.headers?.['content-disposition'] as string | undefined;
    const match = disposition?.match(/filename="?([^";]+)"?/i);
    const filename = match?.[1] ?? 'parking_sessions.xlsx';
    return { blob: response.data, filename };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = `Export parking sessions failed (${status ?? 'unknown'})`;
      throw new ApiRequestError(message, status);
    }
    throw error;
  }
};
