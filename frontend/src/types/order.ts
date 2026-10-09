import type { Farm } from './farm';
import type { Product } from './product';

export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderLine {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product?: Product;
}

export interface Order {
  id: number;
  orderNumber: string;
  farmId: number;
  farm?: Farm;
  status: OrderStatus;
  orderDate: string;
  requestedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes: string | null;
  orderLines?: OrderLine[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderFormData {
  farmId: number;
  orderDate: string;
  requestedDeliveryDate?: string | null;
  notes?: string | null;
  idempotencyKey?: string | null;
  lines: { productId: number; quantity: number }[];
}

export interface OrderLineInput {
  productId: number;
  quantity: number;
}