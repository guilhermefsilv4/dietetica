export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'transfer' | 'qr';

export interface Payment {
  id: string;
  date: Date;
  method: PaymentMethod;
  amount: number;
  reference?: string;  // Referência do pagamento (número do cartão, ID da transferência, etc)
}

export interface SalePayment {
  saleId: string;
  payments: Payment[];
  totalPaid: number;
  change: number;     // Troco (apenas para pagamentos em dinheiro)
} 