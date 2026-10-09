import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from './client';
import type { Farm, FarmFormData } from '../types/farm';

export function useFarms() {
  return useQuery({
    queryKey: ['farms'],
    queryFn: async () => {
      const { data } = await client.get<{ data: Farm[]; count: number }>('/farms');
      return data.data;
    },
  });
}

export function useFarm(id: number) {
  return useQuery({
    queryKey: ['farms', id],
    queryFn: async () => {
      const { data } = await client.get<{ data: Farm }>(`/farms/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateFarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FarmFormData) => {
      const { data } = await client.post<{ data: Farm }>('/farms', formData);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['farms'] }),
  });
}

export function useUpdateFarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...formData }: FarmFormData & { id: number }) => {
      const { data } = await client.put<{ data: Farm }>(`/farms/${id}`, formData);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['farms'] }),
  });
}

export function useDeleteFarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/farms/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['farms'] }),
  });
}