import { Component, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '@services/product.service';
import { Product } from '@interfaces/product.interface';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { SaleService } from '@services/sale.service';
import { TicketService } from '@services/ticket.service';
import { Sale, SaleItem } from '@interfaces/sale.interface';
import { Payment, PaymentMethod } from '@interfaces/payment.interface';
import { ProductVariant } from '@interfaces/product-variant.interface';
import { ConfirmationModalComponent } from '@components/shared/confirmation-modal/confirmation-modal.component';
import { PaginationComponent } from '@components/shared/pagination/pagination.component';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    ConfirmationModalComponent,
    PaginationComponent
  ],
  templateUrl: './sales.component.html',
  styles: []
})
export class SalesComponent {
  // Ícones
  faTrash = faTrash;

  // Referência ao Math para usar no template
  protected Math = Math;

  // Estado do componente
  currentSale = computed(() => this.saleService.getCurrentSale()());
  barcodeInput = '';
  quantityInput = 1;
  selectedPaymentMethod: PaymentMethod = 'cash';
  paymentAmount = 0;

  // Estado da busca
  searchTerm = signal('');
  dateFilter = signal<'today' | 'week' | 'month' | 'all'>('all');

  // Estado da paginação
  currentPage = signal(1);
  itemsPerPage = signal(10);
  filteredSales = computed(() => {
    let sales = this.saleService.getSales()();

    // Filtrar por termo de busca
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      sales = sales.filter(sale =>
        sale.items.some(item =>
          item.name.toLowerCase().includes(term) ||
          item.product?.name.toLowerCase().includes(term) ||
          item.product?.barcode?.toLowerCase() === term // Busca exata por código de barras
        )
      );
    }

    // Filtrar por data
    if (this.dateFilter() !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (this.dateFilter()) {
        case 'today':
          sales = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= today;
          });
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          sales = sales.filter(sale => new Date(sale.date) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          sales = sales.filter(sale => new Date(sale.date) >= monthAgo);
          break;
      }
    }

    return sales;
  });

  paginatedSales = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return {
      items: this.filteredSales().slice(start, end),
      total: this.filteredSales().length
    };
  });

  totalPages = computed(() => Math.ceil(this.filteredSales().length / this.itemsPerPage()));

  // Estado do modal de confirmação
  showCancelConfirmation = signal(false);

  // Formatador de moeda argentino
  private currencyFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  });

  // Computed para calcular o troco em tempo real
  changeAmount = computed(() => {
    const totalPaid = this.getTotalPaid();
    const saleTotal = this.currentSaleTotal();
    return Math.max(0, totalPaid - saleTotal);
  });

  private searchSubject = new Subject<string>();

  constructor(
    private productService: ProductService,
    private saleService: SaleService,
    private ticketService: TicketService
  ) {
    // Configurar debounce para busca
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(term => {
      this.searchTerm.set(term);
    });
  }

  // Computed properties
  availableProducts = computed(() => {
    return this.productService.getProducts()().filter(p => p.stock > 0);
  });

  recentSales = computed(() => {
    return this.saleService.getRecentSales()();
  });

  currentSaleTotal = computed(() => {
    const sale = this.currentSale();
    if (!sale) return 0;
    return sale.items.reduce((total: number, item: SaleItem) => total + item.subtotal, 0);
  });

  todaySalesCount = computed(() => {
    return this.saleService.getTodaySales()().length;
  });

  todaySalesTotal = computed(() => {
    return this.saleService.getTodaySales()()
      .reduce((total, sale) => total + sale.total, 0);
  });

  monthSalesCount = computed(() => {
    return this.saleService.getMonthSales()().length;
  });

  monthSalesTotal = computed(() => {
    return this.saleService.getMonthSales()()
      .reduce((total, sale) => total + sale.total, 0);
  });

  averageTicket = computed(() => {
    return this.saleService.getAverageTicket()();
  });

  // Métodos auxiliares
  getProductName(productId: string): string {
    const product = this.productService.getProductById(productId);
    return product?.name || 'Producto no encontrado';
  }

  getSaleStatusClass(status: Sale['status']): string {
    const baseClass = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'completed':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'cancelled':
        return `${baseClass} bg-red-100 text-red-800`;
      default:
        return baseClass;
    }
  }

  getStatusTooltip(status: Sale['status']): string {
    switch (status) {
      case 'completed':
        return 'Venta finalizada con éxito';
      case 'cancelled':
        return 'Venta cancelada';
      default:
        return 'Estado desconocido';
    }
  }

  getItemsText(sale: Sale): string {
    return sale.items.map(item => item.name).join(', ');
  }

  // Métodos de manipulação da venda
  startNewSale(): void {
    this.saleService.startNewSale();
    this.resetInputs();
  }

  cancelSale(): void {
    this.showCancelConfirmation.set(true);
  }

  async confirmCancelSale(): Promise<void> {
    try {
      await this.saleService.cancelSale();
      this.resetInputs();
      this.showCancelConfirmation.set(false);
    } catch (error) {
      alert('Error al cancelar la venta: ' + (error as Error).message);
      this.showCancelConfirmation.set(false);
    }
  }

  cancelCancelSale(): void {
    this.showCancelConfirmation.set(false);
  }

  // Métodos de produtos
  searchByBarcode(): void {
    if (!this.barcodeInput.trim()) return;

    const result = this.saleService.findProductByBarcode(this.barcodeInput);
    if (result) {
      const { product, variant } = result;
      this.addProductToSale(product, variant);
      this.barcodeInput = '';
    } else {
      alert('Producto no encontrado');
    }
  }

  addProductToSale(product: Product, variant?: ProductVariant): void {
    this.saleService.addItem(product, this.quantityInput, variant);
    this.quantityInput = 1;
  }

  removeItem(itemId: string): void {
    this.saleService.removeItem(itemId);
  }

  updateItemQuantity(itemId: string, quantity: number): void {
    if (quantity > 0) {
      this.saleService.updateItemQuantity(itemId, quantity);
    }
  }

  // Métodos de pagamento
  addPayment(): void {
    if (this.paymentAmount <= 0) {
      alert('Ingrese un monto válido');
      return;
    }

    this.saleService.addPayment(
      this.selectedPaymentMethod,
      this.paymentAmount
    );

    this.paymentAmount = 0;
  }

  getPaymentMethodName(method: string): string {
    const methods: { [key: string]: string } = {
      'cash': 'Efectivo',
      'debit': 'Tarjeta de Débito',
      'credit': 'Tarjeta de Crédito',
      'transfer': 'Transferencia',
      'qr': 'Pago QR'
    };
    return methods[method] || method;
  }

  getTotalPaid(): number {
    const sale = this.currentSale();
    if (!sale) return 0;
    return sale.payments.reduce((sum: number, payment: Payment) => sum + payment.amount, 0);
  }

  getChange(): number {
    return this.saleService.calculateChange();
  }

  getRemainingAmount(): number {
    const sale = this.currentSale();
    if (!sale) return 0;
    return Math.max(0, sale.total - this.getTotalPaid());
  }

  canCompleteSale(): boolean {
    const sale = this.currentSale();
    if (!sale) return false;
    return sale.items.length > 0 && this.getTotalPaid() >= sale.total;
  }

  async completeSale(): Promise<void> {
    try {
      const completedSale = await this.saleService.completeSale();
      if (completedSale) {
        this.resetInputs();
      }
    } catch (error) {
      alert('Error al completar la venta: ' + (error as Error).message);
    }
  }

  // Métodos auxiliares
  private resetInputs(): void {
    this.barcodeInput = '';
    this.quantityInput = 1;
    this.paymentAmount = 0;
    this.selectedPaymentMethod = 'cash';
  }

  // Método para formatar valores monetários
  formatCurrency(value: number): string {
    return this.currencyFormatter.format(value);
  }

  // Métodos de paginação
  onPreviousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  onNextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  // Métodos de filtro
  onSearchChange(term: string) {
    this.searchSubject.next(term);
  }

  onDateFilterChange(filter: 'today' | 'week' | 'month' | 'all') {
    this.dateFilter.set(filter);
    this.currentPage.set(1); // Resetar para primeira página ao filtrar
  }
}
