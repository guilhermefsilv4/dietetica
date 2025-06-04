import { Injectable, signal, computed } from '@angular/core';
import { Sale, SaleItem } from '@interfaces/sale.interface';
import { Product } from '@interfaces/product.interface';
import { ProductVariant } from '@interfaces/product-variant.interface';
import { Payment, PaymentMethod } from '@interfaces/payment.interface';
import { ProductService } from './product.service';
import { TicketService } from './ticket.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private currentSale = signal<Sale | null>(null);
  private sales = signal<Sale[]>([]);

  constructor(
    private productService: ProductService,
    private ticketService: TicketService,
    private http: HttpService
  ) {
    this.loadSales();
  }

  // Carregar vendas do backend
  private async loadSales() {
    try {
      const sales = await this.http.get<Sale[]>('sales');
      this.sales.set(sales);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    }
  }

  // Getters
  getCurrentSale() {
    return computed(() => this.currentSale());
  }

  getSales() {
    return computed(() => this.sales());
  }

  // Iniciar nova venda
  startNewSale() {
    const newSale: Sale = {
      id: crypto.randomUUID(),
      date: new Date(),
      items: [],
      subtotal: 0,
      total: 0,
      payments: [],
      status: 'pending'
    };
    this.currentSale.set(newSale);
    return newSale;
  }

  // Adicionar item à venda
  addItem(product: Product, quantity: number = 1, variant?: ProductVariant) {
    const currentSale = this.currentSale();
    if (!currentSale) return null;

    const newItem: SaleItem = {
      id: crypto.randomUUID(),
      productId: product.id,
      variantId: variant?.id,
      name: variant?.name || product.name,
      quantity,
      unitPrice: variant?.price || product.price,
      price: variant?.price || product.price,
      subtotal: (variant?.price || product.price) * quantity,
      product,
      variant
    };

    const updatedSale: Sale = {
      ...currentSale,
      items: [...currentSale.items, newItem],
      subtotal: currentSale.subtotal + newItem.subtotal,
      total: currentSale.subtotal + newItem.subtotal
    };

    this.currentSale.set(updatedSale);
    return newItem;
  }

  // Remover item da venda
  removeItem(itemId: string) {
    const currentSale = this.currentSale();
    if (!currentSale) return;

    const item = currentSale.items.find(i => i.id === itemId);
    if (!item) return;

    const updatedSale: Sale = {
      ...currentSale,
      items: currentSale.items.filter(i => i.id !== itemId),
      subtotal: currentSale.subtotal - item.subtotal,
      total: currentSale.subtotal - item.subtotal
    };

    this.currentSale.set(updatedSale);
  }

  // Atualizar quantidade de um item
  updateItemQuantity(itemId: string, quantity: number) {
    const currentSale = this.currentSale();
    if (!currentSale) return;

    const updatedItems = currentSale.items.map(item => {
      if (item.id === itemId) {
        const updatedItem = {
          ...item,
          quantity,
          subtotal: item.unitPrice * quantity
        };
        return updatedItem;
      }
      return item;
    });

    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);

    const updatedSale: Sale = {
      ...currentSale,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newSubtotal
    };

    this.currentSale.set(updatedSale);
  }

  // Adicionar pagamento
  addPayment(method: PaymentMethod, amount: number, reference?: string) {
    const currentSale = this.currentSale();
    if (!currentSale) return;

    const newPayment: Payment = {
      id: crypto.randomUUID(),
      method,
      amount,
      date: new Date(),
      reference
    };

    const totalPaid = [...currentSale.payments, newPayment]
      .reduce((sum, payment) => sum + payment.amount, 0);

    const updatedSale: Sale = {
      ...currentSale,
      payments: [...currentSale.payments, newPayment],
      status: totalPaid >= currentSale.total ? 'completed' : 'pending'
    };

    this.currentSale.set(updatedSale);
    return newPayment;
  }

  // Calcular troco
  calculateChange(): number {
    const currentSale = this.currentSale();
    if (!currentSale) return 0;

    const totalPaid = currentSale.payments
      .reduce((sum, payment) => sum + payment.amount, 0);

    return Math.max(0, totalPaid - currentSale.total);
  }

  // Finalizar venda
  async completeSale() {
    const currentSale = this.currentSale();
    if (!currentSale) return;

    const totalPaid = currentSale.payments
      .reduce((sum, payment) => sum + payment.amount, 0);

    if (totalPaid < currentSale.total) {
      throw new Error('Pagamento insuficiente');
    }

    try {
      // Enviar venda para o backend
      const completedSale = await this.http.post<Sale>('sales', {
        ...currentSale,
        status: 'completed',
        createdBy: 'system' // TODO: Implementar autenticação
      });

      // Atualizar estado local
      this.sales.update(sales => [...sales, completedSale]);
      this.currentSale.set(null);

      // Imprimir ticket
      await this.ticketService.printTicket(completedSale);

      return completedSale;
    } catch (error) {
      console.error('Erro ao completar venda:', error);
      throw error;
    }
  }

  // Cancelar venda
  async cancelSale() {
    const currentSale = this.currentSale();
    if (!currentSale) return;

    try {
      // Se a venda já foi salva no backend e não está pendente
      if (currentSale.id && currentSale.status !== 'pending') {
        const cancelledSale = await this.http.put<Sale>(`sales/${currentSale.id}`, {
          status: 'cancelled'
        });
        this.sales.update(sales => sales.map(s => s.id === cancelledSale.id ? cancelledSale : s));
      }

      // Sempre limpa a venda atual
      this.currentSale.set(null);
    } catch (error) {
      console.error('Erro ao cancelar venda:', error);
      throw error;
    }
  }

  // Buscar produto por código de barras
  findProductByBarcode(barcode: string): { product: Product, variant?: ProductVariant } | null {
    const products = this.productService.getProducts()();

    // Primeiro procura nas variações
    for (const product of products) {
      if (product.variants) {
        const variant = product.variants.find(v => v.barcode === barcode);
        if (variant) {
          return { product, variant };
        }
      }
    }

    // Se não encontrou nas variações, procura no produto principal
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      return { product };
    }

    return null;
  }
}
