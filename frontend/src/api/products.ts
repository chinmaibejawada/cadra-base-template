import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from './client';
import type { Product, ProductFormData } from '../types/product';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await client.get<{ data: Product[]; count: number }>('/products');
      return data.data;
    },
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const { data } = await client.get<{ data: Product }>(`/products/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: ProductFormData) => {
      const { data } = await client.post<{ data: Product }>('/products', formData);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...formData }: ProductFormData & { id: number }) => {
      const { data } = await client.put<{ data: Product }>(`/products/${id}`, formData);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/products/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: ['products', 'low-stock'],
    queryFn: async () => {
      const { data } = await client.get<{ data: Product[]; count: number }>('/products/low-stock');
      return data.data;
    },
  });
}