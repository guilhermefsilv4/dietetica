import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '@services/product.service';
import { StockService } from '@services/stock.service';
import { ProductCardComponent } from '@components/product-card/product-card.component';
import { Product } from '@interfaces/product.interface';
import { StockMovement } from '@interfaces/stock-movement.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Métricas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Total de Productos</h3>
          <p class="text-3xl font-bold text-blue-600">{{ totalProducts() }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Productos con Stock Bajo</h3>
          <p class="text-3xl font-bold text-red-600">{{ lowStockCount() }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Movimientos Hoy</h3>
          <p class="text-3xl font-bold text-green-600">{{ todayMovements() }}</p>
        </div>
      </div>

      <!-- Productos con Stock Bajo -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Productos con Stock Bajo</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (product of lowStockProducts(); track product.id) {
            <app-product-card [productData]="product" />
          }
        </div>
      </div>

      <!-- Movimientos Recientes -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Movimientos Recientes</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Final</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (movement of recentMovements(); track movement.id) {
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ movement.date | date:'dd/MM/yyyy HH:mm' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getProductName(movement.productId) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span [class]="getMovementTypeClass(movement.type)">
                      {{ movement.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ movement.quantity }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ movement.currentStock }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class DashboardComponent {
  constructor(
    private productService: ProductService,
    private stockService: StockService
  ) {}

  // Métricas
  totalProducts = computed(() => this.productService.getProducts()().length);
  
  lowStockProducts = computed(() => 
    this.productService.getLowStockProducts(20)
  );

  lowStockCount = computed(() => this.lowStockProducts().length);

  recentMovements = computed(() => 
    this.stockService.getRecentMovements(10)
  );

  todayMovements = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.stockService.getStockMovements()().filter(movement => {
      const movementDate = new Date(movement.date);
      movementDate.setHours(0, 0, 0, 0);
      return movementDate.getTime() === today.getTime();
    }).length;
  });

  // Helpers
  getProductName(productId: string): string {
    const product = this.productService.getProductById(productId);
    return product?.name || 'Producto no encontrado';
  }

  getMovementTypeClass(type: string): string {
    const baseClass = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (type) {
      case 'entrada':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'salida':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'ajuste':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      default:
        return baseClass;
    }
  }
} 