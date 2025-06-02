import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '@services/product.service';
import { Product } from '@interfaces/product.interface';
import { CurrencyArPipe } from '@pipes/currency-ar.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Sale {
  id: string;
  date: Date;
  items: SaleItem[];
  total: number;
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia';
  status: 'completada' | 'cancelada';
}

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyArPipe, FontAwesomeModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header com botão de nova venda -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Ventas</h1>
        <button
          (click)="startNewSale()"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Nueva Venta
        </button>
      </div>

      <!-- Resumo de Vendas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Ventas de Hoy</h3>
          <p class="text-3xl font-bold text-blue-600">{{ todaySalesCount() }}</p>
          <p class="text-sm text-gray-500">Total: {{ todaySalesTotal() | currencyAr }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Ventas del Mes</h3>
          <p class="text-3xl font-bold text-green-600">{{ monthSalesCount() }}</p>
          <p class="text-sm text-gray-500">Total: {{ monthSalesTotal() | currencyAr }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Ticket Promedio</h3>
          <p class="text-3xl font-bold text-purple-600">{{ averageTicket() | currencyAr }}</p>
        </div>
      </div>

      @if (isNewSale()) {
        <!-- Nova Venda -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Nueva Venta</h2>
          
          <!-- Adicionar Produto -->
          <div class="flex gap-4 mb-6">
            <div class="flex-1">
              <select
                [(ngModel)]="selectedProductId"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar producto</option>
                @for (product of availableProducts(); track product.id) {
                  <option [value]="product.id">{{ product.name }} - {{ product.price | currencyAr }}</option>
                }
              </select>
            </div>
            <div class="w-32">
              <input
                type="number"
                [(ngModel)]="selectedQuantity"
                min="1"
                placeholder="Cantidad"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              (click)="addItemToSale()"
              [disabled]="!canAddItem()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Agregar
            </button>
          </div>

          <!-- Lista de Itens -->
          <div class="mb-6">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (item of currentSaleItems(); track item.productId) {
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ getProductName(item.productId) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ item.quantity }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ item.price | currencyAr }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ item.subtotal | currencyAr }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        (click)="removeItem(item.productId)"
                        class="text-red-600 hover:text-red-900"
                      >
                        <fa-icon [icon]="faTrash"></fa-icon>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
              <tfoot class="bg-gray-50">
                <tr>
                  <td colspan="3" class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                    Total:
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {{ currentSaleTotal() | currencyAr }}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Finalizar Venda -->
          <div class="flex justify-between items-center">
            <div class="flex gap-4">
              <select
                [(ngModel)]="selectedPaymentMethod"
                class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Método de pago</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
            <div class="flex gap-4">
              <button
                (click)="cancelSale()"
                class="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                (click)="finalizeSale()"
                [disabled]="!canFinalizeSale()"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                Finalizar Venta
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Histórico de Vendas -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Historial de Ventas</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (sale of recentSales(); track sale.id) {
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ sale.date | date:'dd/MM/yyyy HH:mm' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ sale.items.length }} items
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ sale.total | currencyAr }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ sale.paymentMethod }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="getSaleStatusClass(sale.status)">
                      {{ sale.status }}
                    </span>
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
export class SalesComponent {
  // Ícones
  faTrash = faTrash;

  // Estado do componente
  isNewSale = signal(false);
  selectedProductId = '';
  selectedQuantity = 1;
  selectedPaymentMethod: Sale['paymentMethod'] | '' = '';
  currentSaleItems = signal<SaleItem[]>([]);

  // Mock de vendas usando signal
  private mockSales = signal<Sale[]>([
    {
      id: '1',
      date: new Date(),
      items: [
        { productId: '1', quantity: 2, price: 100, subtotal: 200 }
      ],
      total: 200,
      paymentMethod: 'efectivo',
      status: 'completada'
    }
  ]);

  constructor(private productService: ProductService) {}

  // Computed properties
  availableProducts = computed(() => {
    return this.productService.getProducts()().filter(p => p.stock > 0);
  });

  recentSales = computed(() => {
    return this.mockSales().slice(0, 10);
  });

  currentSaleTotal = computed(() => {
    return this.currentSaleItems().reduce((total, item) => total + item.subtotal, 0);
  });

  todaySalesCount = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.mockSales().filter(sale => {
      const saleDate = new Date(sale.date);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    }).length;
  });

  todaySalesTotal = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.mockSales()
      .filter(sale => {
        const saleDate = new Date(sale.date);
        saleDate.setHours(0, 0, 0, 0);
        return saleDate.getTime() === today.getTime();
      })
      .reduce((total, sale) => total + sale.total, 0);
  });

  monthSalesCount = computed(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.mockSales().filter(sale => new Date(sale.date) >= firstDayOfMonth).length;
  });

  monthSalesTotal = computed(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.mockSales()
      .filter(sale => new Date(sale.date) >= firstDayOfMonth)
      .reduce((total, sale) => total + sale.total, 0);
  });

  averageTicket = computed(() => {
    const sales = this.mockSales();
    if (sales.length === 0) return 0;
    const total = sales.reduce((sum, sale) => sum + sale.total, 0);
    return total / sales.length;
  });

  // Métodos auxiliares
  getProductName(productId: string): string {
    const product = this.productService.getProductById(productId);
    return product?.name || 'Producto no encontrado';
  }

  getSaleStatusClass(status: Sale['status']): string {
    const baseClass = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'completada':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'cancelada':
        return `${baseClass} bg-red-100 text-red-800`;
      default:
        return baseClass;
    }
  }

  // Métodos de manipulação da venda
  startNewSale() {
    this.isNewSale.set(true);
    this.currentSaleItems.set([]);
    this.selectedProductId = '';
    this.selectedQuantity = 1;
    this.selectedPaymentMethod = '';
  }

  canAddItem(): boolean {
    if (!this.selectedProductId || this.selectedQuantity < 1) return false;
    const product = this.productService.getProductById(this.selectedProductId);
    return !!(product && product.stock >= this.selectedQuantity);
  }

  addItemToSale() {
    if (!this.canAddItem()) return;

    const product = this.productService.getProductById(this.selectedProductId);
    if (!product) return;

    const newItem: SaleItem = {
      productId: product.id,
      quantity: this.selectedQuantity,
      price: product.price,
      subtotal: product.price * this.selectedQuantity
    };

    const currentItems = this.currentSaleItems();
    const existingItemIndex = currentItems.findIndex(item => item.productId === product.id);

    if (existingItemIndex >= 0) {
      // Atualiza item existente
      const updatedItems = [...currentItems];
      const existingItem = updatedItems[existingItemIndex];
      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + this.selectedQuantity,
        subtotal: existingItem.price * (existingItem.quantity + this.selectedQuantity)
      };
      this.currentSaleItems.set(updatedItems);
    } else {
      // Adiciona novo item
      this.currentSaleItems.set([...currentItems, newItem]);
    }

    // Limpa seleção
    this.selectedProductId = '';
    this.selectedQuantity = 1;
  }

  removeItem(productId: string) {
    const currentItems = this.currentSaleItems();
    this.currentSaleItems.set(currentItems.filter(item => item.productId !== productId));
  }

  canFinalizeSale(): boolean {
    return this.currentSaleItems().length > 0 && !!this.selectedPaymentMethod;
  }

  finalizeSale() {
    if (!this.canFinalizeSale()) return;

    const newSale: Sale = {
      id: Date.now().toString(),
      date: new Date(),
      items: this.currentSaleItems(),
      total: this.currentSaleTotal(),
      paymentMethod: this.selectedPaymentMethod as Sale['paymentMethod'],
      status: 'completada'
    };

    // Atualiza a lista de vendas usando o signal
    this.mockSales.update(sales => [newSale, ...sales]);

    // Atualiza o estoque
    for (const item of newSale.items) {
      const product = this.productService.getProductById(item.productId);
      if (product) {
        this.productService.updateProduct(product.id, {
          ...product,
          stock: product.stock - item.quantity
        });
      }
    }

    this.cancelSale();
  }

  cancelSale() {
    this.isNewSale.set(false);
    this.currentSaleItems.set([]);
    this.selectedProductId = '';
    this.selectedQuantity = 1;
    this.selectedPaymentMethod = '';
  }
} 