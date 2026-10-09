import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from './client';
import type { Note, NoteFormData, NotableType } from '../types/note';

export function useNotes(notableType: NotableType, notableId: number) {
  return useQuery({
    queryKey: ['notes', notableType, notableId],
    queryFn: async () => {
      const { data } = await client.get<{ data: Note[]; count: number }>(
        `/notes?type=${notableType}&id=${notableId}`
      );
      return data.data;
    },
    enabled: !!notableType && !!notableId,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: NoteFormData) => {
      const { data } = await client.post<{ data: Note }>('/notes', formData);
      return data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.notableType, variables.notableId] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notableType, notableId }: { id: number; notableType: NotableType; notableId: number }) => {
      await client.delete(`/notes/${id}`);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.notableType, variables.notableId] });
    },
  });
}