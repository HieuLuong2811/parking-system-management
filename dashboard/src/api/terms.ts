import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { httpDelete, httpGet, httpPatch, httpPost } from './httpClient';
import type { AcademicTermRecord } from './types';

export type AcademicTermCreatePayload = {
  term_name: string;
  start_date: string;
  end_date: string;
};

export type AcademicTermUpdatePayload = Partial<AcademicTermCreatePayload>;

const fetchAcademicTerms = () => httpGet<AcademicTermRecord[]>('/terms');

export const useAdminAcademicTerms = () => {
  return useQuery({
    queryKey: ['admin', 'academicTerms'],
    queryFn: fetchAcademicTerms,
    staleTime: 1000 * 60,
    retry: false,
  });
};

const createAcademicTerm = (payload: AcademicTermCreatePayload) =>
  httpPost<AcademicTermRecord>('/terms', payload);

const updateAcademicTerm = (id: string, payload: AcademicTermUpdatePayload) =>
  httpPatch<AcademicTermRecord>(`/terms/${id}`, payload);

const deleteAcademicTerm = (id: string) => httpDelete(`/terms/${id}`);

export const useCreateAcademicTerm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AcademicTermCreatePayload) => createAcademicTerm(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'academicTerms'] }),
  });
};

export const useUpdateAcademicTerm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AcademicTermUpdatePayload }) =>
      updateAcademicTerm(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'academicTerms'] }),
  });
};

export const useDeleteAcademicTerm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAcademicTerm(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'academicTerms'] }),
  });
};
