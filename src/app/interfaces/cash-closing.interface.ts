import { PaymentMethod } from './payment.interface';

export interface PaymentTotal {
  method: PaymentMethod;
  total: number;
  expected: number;
  difference: number;
}

export interface CashClosing {
  id: string;
  openedAt: Date;
  closedAt: Date;
  payments: PaymentTotal[];
  totalSales: number;
  totalExpected: number;
  totalActual: number;
  difference: number;
  notes?: string;
  status: 'open' | 'closed';
  closedBy?: string; // ID do usuário que fechou o caixa
} 