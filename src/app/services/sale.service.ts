import { Injectable, signal, computed } from '@angular/core';
import { Sale, SaleItem } from '@interfaces/sale.interface';
import { Product } from '@interfaces/product.interface';
import { ProductVariant } from '@interfaces/product-variant.interface';
import { Payment, PaymentMethod } from '@interfaces/payment.interface';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private currentSale = signal<Sale | null>(null);
  private sales = signal<Sale[]>([]);

  constructor(private productService: ProductService) {}

  // Getters
  getCurrentSale() {
    return computed(() => this.currentSale());
  }

  getSales() {
    return this.sales;
  }

  // Iniciar nova venda
  startNewSale() {
    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
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
      id: Math.random().toString(36).substr(2, 9),
      productId: product.id,
      variantId: variant?.id,
      quantity,
      unitPrice: variant?.price || product.price,
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
      id: Math.random().toString(36).substr(2, 9),
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
  completeSale() {
    const currentSale = this.currentSale();
    if (!currentSale) return;

    const totalPaid = currentSale.payments
      .reduce((sum, payment) => sum + payment.amount, 0);

    if (totalPaid < currentSale.total) {
      throw new Error('Pagamento insuficiente');
    }

    const completedSale: Sale = {
      ...currentSale,
      status: 'completed'
    };

    this.sales.update(sales => [...sales, completedSale]);
    this.currentSale.set(null);

    // Aqui você pode adicionar a lógica para:
    // 1. Atualizar o estoque
    // 2. Imprimir o ticket
    // 3. Salvar a venda no backend
    
    return completedSale;
  }

  // Cancelar venda
  cancelSale() {
    const currentSale = this.currentSale();
    if (!currentSale) return;

    const cancelledSale: Sale = {
      ...currentSale,
      status: 'cancelled'
    };

    this.sales.update(sales => [...sales, cancelledSale]);
    this.currentSale.set(null);
    return cancelledSale;
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