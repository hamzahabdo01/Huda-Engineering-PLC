import { useQuery, useQueryClient, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

interface UseOptimizedQueryOptions<TData, TError> extends Omit<UseQueryOptions<TData, TError>, 'queryKey'> {
  queryKey: string[];
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
  retry?: number | false;
  retryDelay?: number;
  prefetch?: boolean;
  prefetchOnHover?: boolean;
}

export function useOptimizedQuery<TData, TError = Error>({
  queryKey,
  staleTime = 5 * 60 * 1000, // 5 minutes
  gcTime = 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus = false,
  refetchOnMount = true,
  refetchOnReconnect = true,
  retry = 1,
  retryDelay = 1000,
  prefetch = false,
  prefetchOnHover = false,
  ...options
}: UseOptimizedQueryOptions<TData, TError>) {
  const queryClient = useQueryClient();
  const prefetchTimeoutRef = useRef<NodeJS.Timeout>();

  // Optimized query with better defaults
  const query = useQuery<TData, TError>({
    queryKey,
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    retryDelay,
    ...options,
  });

  // Prefetch data if enabled
  useEffect(() => {
    if (prefetch && !query.data) {
      queryClient.prefetchQuery({
        queryKey,
        queryFn: options.queryFn,
        staleTime,
        gcTime,
      });
    }
  }, [prefetch, queryClient, queryKey, options.queryFn, staleTime, gcTime, query.data]);

  // Prefetch on hover
  const handleMouseEnter = useCallback(() => {
    if (prefetchOnHover && !query.data) {
      prefetchTimeoutRef.current = setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey,
          queryFn: options.queryFn,
          staleTime,
          gcTime,
        });
      }, 100); // Small delay to avoid unnecessary prefetching
    }
  }, [prefetchOnHover, query.data, queryClient, queryKey, options.queryFn, staleTime, gcTime]);

  // Manual prefetch function
  const prefetchData = useCallback(async () => {
    try {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: options.queryFn,
        staleTime,
        gcTime,
      });
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }, [queryClient, queryKey, options.queryFn, staleTime, gcTime]);

  // Invalidate and refetch
  const invalidateAndRefetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
    await query.refetch();
  }, [queryClient, queryKey, query]);

  // Update data optimistically
  const updateData = useCallback(
    (updater: (oldData: TData | undefined) => TData) => {
      queryClient.setQueryData(queryKey, updater);
    },
    [queryClient, queryKey]
  );

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...query,
    prefetchData,
    invalidateAndRefetch,
    updateData,
    handleMouseEnter,
  };
}

// Hook for infinite queries with optimization
export function useOptimizedInfiniteQuery<TData, TError = Error>({
  queryKey,
  staleTime = 5 * 60 * 1000,
  gcTime = 10 * 60 * 1000,
  refetchOnWindowFocus = false,
  refetchOnMount = true,
  refetchOnReconnect = true,
  retry = 1,
  retryDelay = 1000,
  ...options
}: UseOptimizedQueryOptions<TData, TError>) {
  const queryClient = useQueryClient();

  const query = useQuery<TData, TError>({
    queryKey,
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    retryDelay,
    ...options,
  });

  // Prefetch next page
  const prefetchNextPage = useCallback(async () => {
    if (options.getNextPageParam) {
      try {
        const nextPageParam = options.getNextPageParam(query.data);
        if (nextPageParam !== undefined) {
          await queryClient.prefetchQuery({
            queryKey: [...queryKey, nextPageParam],
            queryFn: options.queryFn,
            staleTime,
            gcTime,
          });
        }
      } catch (error) {
        console.warn('Next page prefetch failed:', error);
      }
    }
  }, [queryClient, queryKey, options.getNextPageParam, options.queryFn, staleTime, gcTime, query.data]);

  return {
    ...query,
    prefetchNextPage,
  };
}

export default useOptimizedQuery;