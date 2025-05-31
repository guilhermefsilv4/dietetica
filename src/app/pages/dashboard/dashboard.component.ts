import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '@services/product.service';
import { StockService } from '@services/stock.service';
import { ProductCardComponent } from '@components/product-card/product-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Panel de Control</h1>

      <!-- Cards de Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg text-gray-600 mb-2">Productos Totales</h3>
          <p class="text-3xl font-bold text-blue-600">{{ productService.totalProducts() }}</p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg text-gray-600 mb-2">Productos con Stock Bajo</h3>
          <p class="text-3xl font-bold text-orange-600">{{ productService.lowStockProducts().length }}</p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg text-gray-600 mb-2">Movimientos Hoy</h3>
          <p class="text-3xl font-bold text-green-600">{{ stockService.totalMovements() }}</p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg text-gray-600 mb-2">Alertas de Stock</h3>
          <p class="text-3xl font-bold text-red-600">{{ stockService.stockAlerts().length }}</p>
        </div>
      </div>

      <!-- Productos con Stock Bajo -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Productos con Stock Bajo</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (product of productService.lowStockProducts(); track product.id) {
            <app-product-card 
              [productData]="product"
              (onEdit)="handleEditProduct($event)"
              (onDelete)="handleDeleteProduct($event)"
            />
          }
        </div>
      </div>

      <!-- Últimos Movimientos -->
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Últimos Movimientos</h2>
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="min-w-full">
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
              @for (movement of stockService.recentMovements(); track movement.id) {
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ movement.date | date:'dd/MM/yyyy HH:mm' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getProductName(movement.productId) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span [class]="getMovementTypeClass(movement.type)">
                      {{ getMovementTypeLabel(movement.type) }}
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
  `
})
export class DashboardComponent implements OnInit {
  constructor(
    protected productService: ProductService,
    protected stockService: StockService
  ) {}

  ngOnInit() {
    // Carrega dados mock para teste
    this.productService.loadMockData();
    this.stockService.loadMockData();
  }

  getProductName(productId: string): string {
    return this.productService.getProduct(productId)?.name || 'Producto no encontrado';
  }

  getMovementTypeLabel(type: string): string {
    const labels = {
      'entrada': 'Entrada',
      'salida': 'Salida',
      'ajuste': 'Ajuste'
    };
    return labels[type as keyof typeof labels];
  }

  getMovementTypeClass(type: string): string {
    const classes = {
      'entrada': 'inline-flex px-2 text-xs font-semibold rounded-full bg-green-100 text-green-800',
      'salida': 'inline-flex px-2 text-xs font-semibold rounded-full bg-red-100 text-red-800',
      'ajuste': 'inline-flex px-2 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'
    };
    return classes[type as keyof typeof classes];
  }

  handleEditProduct(product: any) {
    // Implementar lógica de edição
    console.log('Editar producto:', product);
  }

  handleDeleteProduct(productId: string) {
    // Implementar lógica de exclusão
    console.log('Eliminar producto:', productId);
  }
} 