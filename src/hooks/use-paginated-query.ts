import { useCallback, useEffect, useState } from 'react';
import { useApi } from './use-api';

export function usePaginatedQuery<T>(request: (signal: AbortSignal, query: { page: number; size: number }) => Promise<{
  content?: T[]; page?: number; size?: number; totalElements?: number; totalPages?: number;
}>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const { execute, cancel, ...state } = useApi(request);
  const reload = useCallback(() => execute({ page: page - 1, size: pageSize }).then(result => {
    const lastPage = Math.max(1, result.totalPages ?? 1);
    if (page > lastPage) setPage(lastPage);
    return result;
  }), [execute, page, pageSize]);
  useEffect(() => { void reload().catch(() => {}); return cancel }, [reload, cancel]);
  const current = state.data?.page === page - 1 && state.data?.size === pageSize && !state.isLoading;
  return {
    ...state, reload,
    records: current ? state.data?.content ?? [] : [],
    pagination: {
      page, pageSize, total: state.data?.totalElements ?? 0,
      pageCount: Math.max(1, state.data?.totalPages ?? 1),
      setPage, setPageSize,
    },
  };
}
