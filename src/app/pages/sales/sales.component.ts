import { Component, computed, signal } from '@angular/core';
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

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, ConfirmationModalComponent],
  templateUrl: './sales.component.html',
  styles: []
})
export class SalesComponent {
  // Ícones
  faTrash = faTrash;

  // Estado do componente
  currentSale = computed(() => this.saleService.getCurrentSale()());
  barcodeInput = '';
  quantityInput = 1;
  selectedPaymentMethod: PaymentMethod = 'cash';
  paymentAmount = 0;

  // Estado do modal de confirmação
  showCancelConfirmation = signal(false);

  // Mock de vendas usando signal
  private mockSales = signal<Sale[]>([
    {
      id: '1',
      date: new Date(),
      items: [
        {
          id: '1',
          productId: '1',
          name: 'Produto Teste',
          quantity: 2,
          unitPrice: 100,
          price: 100,
          subtotal: 200
        }
      ],
      subtotal: 200,
      total: 200,
      payments: [],
      status: 'completed'
    }
  ]);

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

  constructor(
    private productService: ProductService,
    private saleService: SaleService,
    private ticketService: TicketService
  ) {}

  // Computed properties
  availableProducts = computed(() => {
    return this.productService.getProducts()().filter(p => p.stock > 0);
  });

  recentSales = computed(() => {
    return this.mockSales().slice(0, 10);
  });

  currentSaleTotal = computed(() => {
    const sale = this.currentSale();
    if (!sale) return 0;
    return sale.items.reduce((total: number, item: SaleItem) => total + item.subtotal, 0);
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
}
