import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '@services/product.service';
import { Product } from '@interfaces/product.interface';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TooltipComponent } from '@components/tooltip/tooltip.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, TooltipComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header com botão de adicionar -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Productos</h1>
        <button
          (click)="openProductModal()"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Agregar Producto
        </button>
      </div>

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

      <!-- Lista de Produtos -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
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
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ product.price.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <app-tooltip [text]="getStockTooltip(product.stock)">
                    <span [class]="getStockClass(product.stock)">
                      {{ product.stock }}
                    </span>
                  </app-tooltip>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <app-tooltip text="Editar producto">
                    <button
                      (click)="openProductModal(product)"
                      class="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <fa-icon [icon]="faEdit"></fa-icon>
                    </button>
                  </app-tooltip>
                  <app-tooltip text="Eliminar producto">
                    <button
                      (click)="deleteProduct(product)"
                      class="text-red-600 hover:text-red-900"
                    >
                      <fa-icon [icon]="faTrash"></fa-icon>
                    </button>
                  </app-tooltip>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal de Produto -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">
              {{ editingProduct ? 'Editar Producto' : 'Nuevo Producto' }}
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  [(ngModel)]="productForm.name"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  [(ngModel)]="productForm.brand"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  [(ngModel)]="productForm.category"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Precio
                </label>
                <input
                  type="number"
                  [(ngModel)]="productForm.price"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Stock Inicial
                </label>
                <input
                  type="number"
                  [(ngModel)]="productForm.stock"
                  [disabled]="!!editingProduct"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  URL de la Imagen
                </label>
                <input
                  type="text"
                  [(ngModel)]="productForm.imageUrl"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Descripción
                </label>
                <textarea
                  [(ngModel)]="productForm.description"
                  rows="3"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
            <div class="flex justify-end gap-4 mt-6">
              <button
                (click)="closeModal()"
                class="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                (click)="saveProduct()"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                [disabled]="!isValidProduct()"
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
export class ProductsComponent {
  // Ícones
  faEdit = faEdit;
  faTrash = faTrash;

  // Estado do componente
  searchTerm = signal('');
  selectedCategory = signal('');
  showModal = signal(false);
  editingProduct: Product | null = null;

  productForm: Partial<Product> = {
    name: '',
    brand: '',
    category: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: ''
  };

  constructor(private productService: ProductService) {}

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

  getStockTooltip(stock: number): string {
    if (stock <= 10) {
      return 'Stock crítico';
    } else if (stock <= 20) {
      return 'Stock bajo';
    } else {
      return 'Stock normal';
    }
  }

  // Métodos de manipulação do modal
  openProductModal(product?: Product) {
    if (product) {
      this.editingProduct = product;
      this.productForm = { ...product };
    } else {
      this.editingProduct = null;
      this.productForm = {
        name: '',
        brand: '',
        category: '',
        description: '',
        price: 0,
        stock: 0,
        imageUrl: ''
      };
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingProduct = null;
    this.productForm = {
      name: '',
      brand: '',
      category: '',
      description: '',
      price: 0,
      stock: 0,
      imageUrl: ''
    };
  }

  isValidProduct(): boolean {
    return !!(
      this.productForm.name &&
      this.productForm.brand &&
      this.productForm.category &&
      this.productForm.description &&
      this.productForm.price &&
      (this.editingProduct || this.productForm.stock) &&
      this.productForm.imageUrl
    );
  }

  saveProduct() {
    if (!this.isValidProduct()) {
      return;
    }

    try {
      if (this.editingProduct) {
        this.productService.updateProduct(this.editingProduct.id, this.productForm as Product);
      } else {
        this.productService.addProduct(this.productForm as Product);
      }
      this.closeModal();
    } catch (error) {
      console.error('Error al guardar producto:', error);
    }
  }

  deleteProduct(product: Product) {
    if (confirm(`¿Está seguro que desea eliminar el producto "${product.name}"?`)) {
      try {
        this.productService.deleteProduct(product.id);
      } catch (error) {
        console.error('Error al eliminar producto:', error);
      }
    }
  }
} 