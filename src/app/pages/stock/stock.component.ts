import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '@services/product.service';
import { StockService } from '@services/stock.service';
import { Product } from '@interfaces/product.interface';
import { StockMovement, StockMovementType } from '@interfaces/stock-movement.interface';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowUp, faArrowDown, faSliders } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              placeholder="Buscar productos..."
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              [(ngModel)]="selectedCategory"
              class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              @for (category of categories(); track category) {
                <option [value]="category">{{ category }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Lista de Productos -->
      <div class="bg-white rounded-lg shadow overflow-hidden mb-8">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (product of filteredProducts(); track product.id) {
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                      <img [src]="product.imageUrl" class="h-10 w-10 rounded-full object-cover" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                      <div class="text-sm text-gray-500">{{ product.brand }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ product.category }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getStockClass(product.stock)">
                    {{ product.stock }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    (click)="openMovementModal(product, 'entrada')"
                    class="text-green-600 hover:text-green-900 mr-4"
                  >
                    <fa-icon [icon]="faArrowUp"></fa-icon>
                  </button>
                  <button
                    (click)="openMovementModal(product, 'salida')"
                    class="text-red-600 hover:text-red-900 mr-4"
                  >
                    <fa-icon [icon]="faArrowDown"></fa-icon>
                  </button>
                  <button
                    (click)="openMovementModal(product, 'ajuste')"
                    class="text-yellow-600 hover:text-yellow-900"
                  >
                    <fa-icon [icon]="faSliders"></fa-icon>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal de Movimentação -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">
              {{ getMovementTitle(selectedMovementType) }}
            </h2>
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Producto
              </label>
              <p class="text-gray-600">{{ selectedProduct?.name }}</p>
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Cantidad
              </label>
              <input
                type="number"
                [(ngModel)]="movementQuantity"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Descripción
              </label>
              <textarea
                [(ngModel)]="movementDescription"
                rows="3"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            <div class="flex justify-end gap-4">
              <button
                (click)="closeModal()"
                class="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                (click)="saveMovement()"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                [disabled]="!isValidMovement()"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: ``
})
export class StockComponent {
  // Ícones
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faSliders = faSliders;

  // Estado do componente
  searchTerm = signal('');
  selectedCategory = signal('');
  showModal = signal(false);
  selectedProduct: Product | null = null;
  selectedMovementType: StockMovementType | null = null;
  movementQuantity = 0;
  movementDescription = '';

  constructor(
    private productService: ProductService,
    private stockService: StockService
  ) {}

  // Computed properties
  categories = computed(() => {
    const products = this.productService.getProducts()();
    return [...new Set(products.map(p => p.category))].sort();
  });

  filteredProducts = computed(() => {
    let products = this.productService.getProducts()();
    
    // Filtrar por termo de busca
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term)
      );
    }

    // Filtrar por categoria
    if (this.selectedCategory()) {
      products = products.filter(p => p.category === this.selectedCategory());
    }

    return products;
  });

  // Métodos auxiliares
  getStockClass(stock: number): string {
    if (stock <= 10) {
      return 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800';
    } else if (stock <= 20) {
      return 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800';
    } else {
      return 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800';
    }
  }

  getMovementTitle(type: StockMovementType | null): string {
    switch (type) {
      case 'entrada':
        return 'Registrar Entrada';
      case 'salida':
        return 'Registrar Salida';
      case 'ajuste':
        return 'Ajustar Stock';
      default:
        return 'Movimiento de Stock';
    }
  }

  // Métodos de manipulação do modal
  openMovementModal(product: Product, type: StockMovementType) {
    this.selectedProduct = product;
    this.selectedMovementType = type;
    this.movementQuantity = 0;
    this.movementDescription = '';
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedProduct = null;
    this.selectedMovementType = null;
    this.movementQuantity = 0;
    this.movementDescription = '';
  }

  isValidMovement(): boolean {
    return !!(
      this.selectedProduct &&
      this.selectedMovementType &&
      this.movementQuantity > 0 &&
      this.movementDescription.trim()
    );
  }

  saveMovement() {
    if (!this.selectedProduct || !this.selectedMovementType || !this.isValidMovement()) {
      return;
    }

    try {
      this.stockService.addStockMovement(
        this.selectedProduct.id,
        this.selectedMovementType,
        this.movementQuantity,
        this.movementDescription
      );
      this.closeModal();
    } catch (error) {
      // Em um ambiente real, você deve mostrar uma mensagem de erro apropriada
      console.error('Error al registrar movimiento:', error);
    }
  }
} 