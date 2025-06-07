import { Injectable, signal } from '@angular/core';
import { StockMovement, StockMovementType } from '@interfaces/stock-movement.interface';
import { MOCK_STOCK_MOVEMENTS } from '@app/mocks/stock-movements.mock';
import { ProductService } from '@services/product.service';
import { HttpService } from './http.service';
import { from, Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private stockMovements = signal<StockMovement[]>(MOCK_STOCK_MOVEMENTS);

  // Signal para movimentações do banco - mantém compatibilidade total
  private stockMovementsDb = signal<StockMovement[]>([]);

  // Observable com shareReplay para cache automático do carregamento
  private loadMovements$: Observable<StockMovement[]> | null = null;

  constructor(
    private productService: ProductService,
    private http: HttpService
  ) {
    // Carrega dados automaticamente na primeira vez
    this.loadStockMovementsDb();
  }

  getStockMovements() {
    return this.stockMovements();
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

  // Métodos para movimentações do banco SQLite com cache inteligente
  getStockMovementsDb() {
    return this.stockMovementsDb();
  }

  async loadStockMovementsDb() {
    // Se já temos um observable cached, use-o
    if (this.loadMovements$) {
      try {
        await this.loadMovements$.toPromise();
        return;
      } catch (error) {
        // Se deu erro, vamos tentar novamente
        this.loadMovements$ = null;
      }
    }

    // Cria um novo observable com shareReplay
    this.loadMovements$ = from(this.http.get<StockMovement[]>('stock-movements')).pipe(
      tap(movements => this.stockMovementsDb.set(movements)),
      shareReplay(1)
    );

    try {
      await this.loadMovements$.toPromise();
    } catch (error) {
      console.error('Erro ao carregar movimentações do banco:', error);
      this.stockMovementsDb.set([]);
      this.loadMovements$ = null; // Remove cache em caso de erro
    }
  }

  async addStockMovementDb(
    productId: string,
    type: StockMovementType,
    quantity: number,
    description: string
  ) {
    try {
      const product = await this.productService.getProductByIdDb(productId);
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
          currentStock = previousStock + quantity;
          if (currentStock < 0) {
            throw new Error('El ajuste resultaría en stock negativo');
          }
          break;
      }

      const newMovement: Omit<StockMovement, 'id'> = {
        productId,
        type,
        quantity,
        date: new Date(),
        description,
        previousStock,
        currentStock,
        userId: 'USER001' // Mockado por enquanto
      };

      const savedMovement = await this.http.post<StockMovement>('stock-movements', newMovement);

      // Atualiza o signal com a nova movimentação
      this.stockMovementsDb.update(movements => [...movements, savedMovement]);

      // Atualiza o estoque do produto
      await this.productService.updateProductDb(productId, { stock: currentStock });

      // Invalida o cache para próxima busca pegar dados frescos
      this.loadMovements$ = null;

      return savedMovement;
    } catch (error) {
      console.error('Erro ao adicionar movimentação no banco:', error);
      throw error;
    }
  }

  getMovementsByProductDb(productId: string) {
    return this.stockMovementsDb().filter(movement => movement.productId === productId);
  }

  getRecentMovementsDb(page: number = 1, pageSize: number = 10) {
    const sortedMovements = [...this.stockMovementsDb()]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      movements: sortedMovements.slice(start, end),
      total: sortedMovements.length,
      totalPages: Math.ceil(sortedMovements.length / pageSize),
      currentPage: page
    };
  }

  getStockMovementsByDateRangeDb(startDate: Date, endDate: Date) {
    return this.stockMovementsDb().filter(movement => {
      const movementDate = new Date(movement.date);
      return movementDate >= startDate && movementDate <= endDate;
    });
  }

  getStockMovementsByTypeDb(type: StockMovementType) {
    return this.stockMovementsDb().filter(movement => movement.type === type);
  }

  // Método para forçar recarregamento (invalida cache)
  async refreshMovements() {
    this.loadMovements$ = null; // Invalida cache
    await this.loadStockMovementsDb();
  }
}
