export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  document: string;
  createdAt: Date;
  totalPurchases: number;
  lastPurchaseDate?: Date;
} 