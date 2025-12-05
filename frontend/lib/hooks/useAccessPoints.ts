import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import {
  getAccessPoints,
  createAccessPoint,
  getAccessPointById,
  updateAccessPoint,
  deleteAccessPoint,
} from '@/lib/api';
import type { AccessPoint, CreateAccessPointDto, UpdateAccessPointDto } from '@/types';

/**
 * Hook to fetch all access points (configuration)
 */
export function useAccessPoints(): UseQueryResult<AccessPoint[], Error> {
  return useQuery({
    queryKey: ['security', 'access-points-config'],
    queryFn: getAccessPoints,
    staleTime: 30000, // Cache for 30 seconds
  });
}

/**
 * Hook to fetch a single access point by ID
 */
export function useAccessPoint(id: string): UseQueryResult<AccessPoint, Error> {
  return useQuery({
    queryKey: ['security', 'access-points-config', id],
    queryFn: () => getAccessPointById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new access point
 */
export function useCreateAccessPoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccessPointDto) => createAccessPoint(data),
    onSuccess: () => {
      // Invalidate and refetch access points list
      queryClient.invalidateQueries({ queryKey: ['security', 'access-points-config'] });
    },
  });
}

/**
 * Hook to update an access point
 */
export function useUpdateAccessPoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccessPointDto }) =>
      updateAccessPoint(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['security', 'access-points-config'] });

      // Snapshot previous value
      const previousAccessPoints = queryClient.getQueryData<AccessPoint[]>([
        'security',
        'access-points-config',
      ]);

      // Optimistically update cache
      if (previousAccessPoints) {
        queryClient.setQueryData<AccessPoint[]>(
          ['security', 'access-points-config'],
          previousAccessPoints.map((ap) =>
            ap.id === id ? { ...ap, ...data, updatedAt: new Date() } : ap
          )
        );
      }

      return { previousAccessPoints };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousAccessPoints) {
        queryClient.setQueryData(
          ['security', 'access-points-config'],
          context.previousAccessPoints
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['security', 'access-points-config'] });
    },
  });
}

/**
 * Hook to delete an access point
 */
export function useDeleteAccessPoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAccessPoint(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['security', 'access-points-config'] });

      // Snapshot previous value
      const previousAccessPoints = queryClient.getQueryData<AccessPoint[]>([
        'security',
        'access-points-config',
      ]);

      // Optimistically update cache
      if (previousAccessPoints) {
        queryClient.setQueryData<AccessPoint[]>(
          ['security', 'access-points-config'],
          previousAccessPoints.filter((ap) => ap.id !== id)
        );
      }

      return { previousAccessPoints };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousAccessPoints) {
        queryClient.setQueryData(
          ['security', 'access-points-config'],
          context.previousAccessPoints
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['security', 'access-points-config'] });
    },
  });
}
