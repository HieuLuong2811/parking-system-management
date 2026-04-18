import { httpGet } from './httpClient';
import type { PaginatedResponse } from './types';

type QueryParams = Record<string, string | number | boolean | undefined | null>;

const toQuery = (params: QueryParams) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    search.append(key, String(value));
  });
  return search.toString();
};

export const fetchAllPaginated = async <T>(
  path: string,
  params: QueryParams = {},
  pageSize = 100
): Promise<T[]> => {
  const items: T[] = [];
  let page = 1;

  while (true) {
    const query = toQuery({ ...params, page, limit: pageSize });
    const response = await httpGet<PaginatedResponse<T>>(`${path}${query ? `?${query}` : ''}`);
    items.push(...(response.data ?? []));

    const totalPages = response.total_pages ?? 0;
    if (!totalPages || page >= totalPages) break;
    page += 1;
  }

  return items;
};

