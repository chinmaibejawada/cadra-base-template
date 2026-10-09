export type NotableType = 'order' | 'farm' | 'product';

export interface Note {
  id: number;
  notableType: NotableType;
  notableId: number;
  content: string;
  author: string | null;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteFormData {
  notableType: NotableType;
  notableId: number;
  content: string;
  author?: string | null;
  isInternal?: boolean;
}