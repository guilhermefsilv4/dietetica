import { Sale } from './sale.interface';

export interface Ticket {
  id: string;
  saleId: string;
  content: string;
  createdAt: Date;
  expiresAt: Date; // TTL - Time To Live
  sale: Sale;
  printed: boolean;
} 