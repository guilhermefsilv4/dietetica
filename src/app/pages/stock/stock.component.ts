import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '@services/product.service';
import { StockService } from '@services/stock.service';
import { Product } from '@interfaces/product.interface';
import { StockMovementType } from '@interfaces/stock-movement.interface';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Control de Stock</h1>

      <!-- Formulário de Movimentação -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">Registrar Movimiento</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Seleção de Produto -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Producto</label>
            <select 
              [(ngModel)]="selectedProductId"
              (ngModelChange)="handleProductChange($event)"
              class="w-full border border-gray-300 rounded-md shadow-sm p-2">
              <option value="">Seleccionar producto</option>
              @for (product of productService.filteredProducts(); track product.id) {
                <option [value]="product.id">{{ product.name }} (Stock: {{ product.stock }})</option>
              }
            </select>
          </div>

          <!-- Tipo de Movimentação -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Movimiento</label>
            <select 
              [(ngModel)]="movementType"
              class="w-full border border-gray-300 rounded-md shadow-sm p-2">
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="ajuste">Ajuste</option>
            </select>
          </div>

          <!-- Quantidade -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
            <input 
              type="number"
              [(ngModel)]="quantity"
              min="0"
              class="w-full border border-gray-300 rounded-md shadow-sm p-2">
          </div>

          <!-- Descrição -->
          <div class="md:col-span-2 lg:col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <input 
              type="text"
              [(ngModel)]="description"
              class="w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Ingrese una descripción para el movimiento">
          </div>
        </div>

        <!-- Botão de Registro -->
        <div class="mt-4">
          <button 
            (click)="registerMovement()"
            [disabled]="!isFormValid()"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
            Registrar Movimiento
          </button>
        </div>
      </div>

      <!-- Histórico de Movimentações -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">Historial de Movimientos</h2>
          
          <!-- Filtro por Produto -->
          <div class="mb-4">
            <select 
              [(ngModel)]="filterProductId"
              (ngModelChange)="handleFilterChange($event)"
              class="border border-gray-300 rounded-md shadow-sm p-2">
              <option value="">Todos los productos</option>
              @for (product of productService.filteredProducts(); track product.id) {
                <option [value]="product.id">{{ product.name }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Tabela de Movimentações -->
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Anterior</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Final</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (movement of filteredMovements(); track movement.id) {
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ movement.date | date:'dd/MM/yyyy HH:mm' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getProductName(movement.productId) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getMovementTypeClass(movement.type)">
                    {{ getMovementTypeLabel(movement.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ movement.quantity }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ movement.previousStock }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ movement.currentStock }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ movement.description }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class StockComponent implements OnInit {
  // Form fields
  selectedProductId = signal<string>('');
  movementType = signal<StockMovementType>('entrada');
  quantity = signal<number>(0);
  description = signal<string>('');
  filterProductId = signal<string>('');

  constructor(
    protected productService: ProductService,
    private stockService: StockService
  ) {}

  ngOnInit() {
    this.productService.loadMockData();
    this.stockService.loadMockData();
  }

  // Computed values
  filteredMovements = signal<any[]>([]);

  handleProductChange(productId: string) {
    this.selectedProductId.set(productId);
  }

  handleFilterChange(productId: string) {
    this.filterProductId.set(productId);
    this.updateFilteredMovements();
  }

  updateFilteredMovements() {
    const productId = this.filterProductId();
    if (productId) {
      this.filteredMovements.set(this.stockService.getMovementsByProduct(productId));
    } else {
      this.filteredMovements.set(this.stockService.recentMovements());
    }
  }

  isFormValid(): boolean {
    return !!(
      this.selectedProductId() &&
      this.movementType() &&
      this.quantity() > 0 &&
      this.description()
    );
  }

  registerMovement() {
    if (!this.isFormValid()) return;

    try {
      this.stockService.registerMovement(
        this.selectedProductId(),
        this.movementType(),
        this.quantity(),
        this.description(),
        'admin' // TODO: Implementar autenticação
      );

      // Reset form
      this.selectedProductId.set('');
      this.movementType.set('entrada');
      this.quantity.set(0);
      this.description.set('');

      // Update filtered movements
      this.updateFilteredMovements();
    } catch (error) {
      console.error('Error al registrar movimiento:', error);
      // TODO: Implementar notificação de erro
    }
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
} 