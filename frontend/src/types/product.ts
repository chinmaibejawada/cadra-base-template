export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  unit: string;
  unitPrice: number;
  currentStock: number;
  reorderPoint: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  sku: string;
  name: string;
  description?: string | null;
  category?: string | null;
  unit: string;
  unitPrice: number;
  currentStock?: number;
  reorderPoint?: number;
}