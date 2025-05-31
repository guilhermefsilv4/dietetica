import { Injectable, computed, signal } from '@angular/core';
import { StockMovement, StockMovementType } from '@interfaces/stock-movement.interface';
import { ProductService } from '@services/product.service';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  // Signals
  private readonly stockMovements = signal<StockMovement[]>([]);

  // Computed values
  readonly recentMovements = computed(() => {
    return this.stockMovements()
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);
  });

  readonly stockAlerts = computed(() => {
    return this.productService.lowStockProducts();
  });

  readonly totalMovements = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.stockMovements()
      .filter(movement => {
        const movementDate = new Date(movement.date);
        movementDate.setHours(0, 0, 0, 0);
        return movementDate.getTime() === today.getTime();
      }).length;
  });

  constructor(private productService: ProductService) {}

  // Methods
  registerMovement(
    productId: string,
    type: StockMovementType,
    quantity: number,
    description: string,
    userId: string
  ) {
    const product = this.productService.getProduct(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const previousStock = product.stock;
    let currentStock = previousStock;

    switch (type) {
      case 'entrada':
        currentStock += quantity;
        break;
      case 'salida':
        if (previousStock < quantity) {
          throw new Error('Stock insuficiente');
        }
        currentStock -= quantity;
        break;
      case 'ajuste':
        currentStock = quantity;
        break;
    }

    const movement: StockMovement = {
      id: crypto.randomUUID(),
      productId,
      type,
      quantity,
      date: new Date(),
      description,
      previousStock,
      currentStock,
      userId
    };

    this.stockMovements.update(movements => [...movements, movement]);
    this.productService.updateProductStock(productId, currentStock);
  }

  getMovementsByProduct(productId: string): StockMovement[] {
    return this.stockMovements()
      .filter(movement => movement.productId === productId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // Mock data for testing
  loadMockData() {
    const mockMovements: StockMovement[] = [
      {
        id: '1',
        productId: '1',
        type: 'entrada',
        quantity: 100,
        date: new Date(2024, 4, 30),
        description: 'Compra inicial',
        previousStock: 0,
        currentStock: 100,
        userId: 'admin'
      },
      {
        id: '2',
        productId: '1',
        type: 'salida',
        quantity: 50,
        date: new Date(2024, 4, 30),
        description: 'Venta',
        previousStock: 100,
        currentStock: 50,
        userId: 'admin'
      }
    ];

    this.stockMovements.set(mockMovements);
  }
} 