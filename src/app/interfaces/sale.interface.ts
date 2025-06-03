import { Payment } from './payment.interface';
import { Product } from './product.interface';
import { ProductVariant } from './product-variant.interface';

export interface SaleItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: Product;      // Para referência
  variant?: ProductVariant; // Para referência
}

export interface Sale {
  id: string;
  date: Date;
  items: SaleItem[];
  subtotal: number;
  total: number;
  payments: Payment[];
  status: 'pending' | 'completed' | 'cancelled';
  customerName?: string;  // Nome do cliente (opcional)
  notes?: string;        // Observações adicionais
} 