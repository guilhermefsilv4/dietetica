import { StockMovement } from '@interfaces/stock-movement.interface';

export const MOCK_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: '1',
    productId: '1',
    type: 'entrada',
    quantity: 20,
    date: new Date('2024-03-15'),
    description: 'Compra inicial de quinoa',
    previousStock: 30,
    currentStock: 50,
    userId: 'USER001'
  },
  {
    id: '2',
    productId: '2',
    type: 'salida',
    quantity: 5,
    date: new Date('2024-03-16'),
    description: 'Venta a cliente',
    previousStock: 35,
    currentStock: 30,
    userId: 'USER001'
  },
  {
    id: '3',
    productId: '5',
    type: 'ajuste',
    quantity: -2,
    date: new Date('2024-03-16'),
    description: 'Ajuste por inventario',
    previousStock: 17,
    currentStock: 15,
    userId: 'USER001'
  },
  {
    id: '4',
    productId: '3',
    type: 'entrada',
    quantity: 10,
    date: new Date('2024-03-17'),
    description: 'Reposición de stock',
    previousStock: 15,
    currentStock: 25,
    userId: 'USER001'
  },
  {
    id: '5',
    productId: '4',
    type: 'salida',
    quantity: 8,
    date: new Date('2024-03-17'),
    description: 'Venta mayorista',
    previousStock: 68,
    currentStock: 60,
    userId: 'USER001'
  }
]; 