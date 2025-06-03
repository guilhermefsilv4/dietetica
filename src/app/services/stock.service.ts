import { Injectable, signal } from '@angular/core';
import { StockMovement, StockMovementType } from '@interfaces/stock-movement.interface';
import { MOCK_STOCK_MOVEMENTS } from '@app/mocks/stock-movements.mock';
import { ProductService } from '@services/product.service';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private stockMovements = signal<StockMovement[]>(MOCK_STOCK_MOVEMENTS);

  constructor(private productService: ProductService) {}

  getStockMovements() {
    return this.stockMovements;
  }

  getMovementsByProduct(productId: string) {
    return this.stockMovements().filter(movement => movement.productId === productId);
  }

  getRecentMovements(limit: number = 10) {
    return [...this.stockMovements()]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  addStockMovement(
    productId: string,
    type: StockMovementType,
    quantity: number,
    description: string
  ) {
    const product = this.productService.getProductById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const previousStock = product.stock;
    let currentStock = previousStock;

    switch (type) {
      case 'entrada':
        currentStock = previousStock + quantity;
        break;
      case 'salida':
        if (previousStock < quantity) {
          throw new Error('Stock insuficiente');
        }
        currentStock = previousStock - quantity;
        break;
      case 'ajuste':
        currentStock = previousStock + quantity; // quantity pode ser negativo para ajustes de redução
        if (currentStock < 0) {
          throw new Error('El ajuste resultaría en stock negativo');
        }
        break;
    }

    const newMovement: StockMovement = {
      id: Math.random().toString(36).substr(2, 9),
      productId,
      type,
      quantity,
      date: new Date(),
      description,
      previousStock,
      currentStock,
      userId: 'USER001' // Mockado por enquanto
    };

    this.stockMovements.update(movements => [...movements, newMovement]);
    this.productService.updateProduct(productId, { stock: currentStock });

    return newMovement;
  }

  getStockMovementsByDateRange(startDate: Date, endDate: Date) {
    return this.stockMovements().filter(movement => 
      movement.date >= startDate && movement.date <= endDate
    );
  }

  getStockMovementsByType(type: StockMovementType) {
    return this.stockMovements().filter(movement => movement.type === type);
  }
} 