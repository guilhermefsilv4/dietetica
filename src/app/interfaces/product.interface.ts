export interface Product {
  id: string;
  barcode: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  saleType: 'unit' | 'weight';
  weightUnit?: 'kg' | 'g';
  brand: string;
  imageUrl: string;
} 