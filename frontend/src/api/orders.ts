import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from './client';
import type { Order, OrderFormData } from '../types/order';

export function useOrders(filters?: { farmId?: number; status?: string }) {
  const params = new URLSearchParams();
  if (filters?.farmId) params.set('farmId', String(filters.farmId));
  if (filters?.status) params.set('status', filters.status);
  const qs = params.toString();

  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const { data } = await client.get<{ data: Order[]; count: number }>(`/orders${qs ? `?${qs}` : ''}`);
      return data.data;
    },
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const { data } = await client.get<{ data: Order }>(`/orders/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: OrderFormData) => {
      const { data } = await client.post<{ data: Order }>('/orders', formData);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...formData }: Partial<OrderFormData> & { id: number }) => {
      const { data } = await client.put<{ data: Order }>(`/orders/${id}`, formData);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, actualDeliveryDate }: { id: number; status: string; actualDeliveryDate?: string | null }) => {
      const { data } = await client.patch<{ data: Order }>(`/orders/${id}/status`, { status, actualDeliveryDate });
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await client.post<{ data: Order }>(`/orders/${id}/cancel`);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/orders/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}