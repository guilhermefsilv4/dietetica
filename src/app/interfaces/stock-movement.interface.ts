export type StockMovementType = 'entrada' | 'salida' | 'ajuste';

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  date: Date;
  description: string;
  previousStock: number;
  currentStock: number;
  userId: string; // para rastreabilidade
} 