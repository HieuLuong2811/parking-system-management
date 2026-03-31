import { useQuery } from '@tanstack/react-query';

import { clientHttp, requestWithContext, AcademicTerm } from './clientApi';

const fetchAcademicTerms = async (): Promise<AcademicTerm[]> => {
  return requestWithContext(
    clientHttp.get<AcademicTerm[]>('/terms'),
    'Load academic terms'
  );
};

export const useAcademicTerms = () => {
  return useQuery({
    queryKey: ['academicTerms'],
    queryFn: fetchAcademicTerms,
    staleTime: 1000 * 60 * 5,
  });
};
