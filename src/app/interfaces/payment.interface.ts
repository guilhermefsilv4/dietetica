export type PaymentMethod = 'debit' | 'credit' | 'qr' | 'cash' | 'transfer';

export interface Payment {
  id: string;
  method: PaymentMethod;
  amount: number;
  date: Date;
  reference?: string;  // Referência do pagamento (número do cartão, ID da transferência, etc)
}

export interface SalePayment {
  saleId: string;
  payments: Payment[];
  totalPaid: number;
  change: number;     // Troco (apenas para pagamentos em dinheiro)
} 