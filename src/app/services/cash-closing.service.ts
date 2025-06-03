import { Injectable, signal, computed } from '@angular/core';
import { CashClosing, PaymentTotal } from '@interfaces/cash-closing.interface';
import { PaymentMethod } from '@interfaces/payment.interface';
import { Sale } from '@interfaces/sale.interface';
import { SaleService } from './sale.service';

@Injectable({
  providedIn: 'root'
})
export class CashClosingService {
  private currentClosing = signal<CashClosing | null>(null);
  private closingHistory = signal<CashClosing[]>([]);

  constructor(private saleService: SaleService) {
    // Ao iniciar o serviço, verifica se há um fechamento aberto
    this.checkForOpenClosing();
  }

  // Getters
  getCurrentClosing = computed(() => this.currentClosing());
  getClosingHistory = computed(() => this.closingHistory());

  private checkForOpenClosing() {
    // TODO: Implementar verificação no backend
    // Por enquanto, sempre inicia um novo fechamento se não houver um aberto
    if (!this.currentClosing()) {
      this.openNewClosing();
    }
  }

  openNewClosing() {
    const newClosing: CashClosing = {
      id: Math.random().toString(36).substr(2, 9),
      openedAt: new Date(),
      closedAt: new Date(), // Será atualizado no fechamento
      payments: [],
      totalSales: 0,
      totalExpected: 0,
      totalActual: 0,
      difference: 0,
      status: 'open'
    };

    this.currentClosing.set(newClosing);
    return newClosing;
  }

  async closeCurrentClosing(actualAmounts: Record<PaymentMethod, number>, notes?: string) {
    const current = this.currentClosing();
    if (!current || current.status === 'closed') return null;

    // Obtém todas as vendas desde a abertura do caixa
    const sales = this.saleService.getSales()();
    const relevantSales = sales.filter(sale => 
      sale.status === 'completed' && 
      new Date(sale.date) >= current.openedAt
    );

    // Calcula totais esperados por método de pagamento
    const expectedTotals = this.calculateExpectedTotals(relevantSales);

    // Calcula diferenças
    const payments: PaymentTotal[] = Object.entries(expectedTotals).map(([method, expected]) => ({
      method: method as PaymentMethod,
      total: expected,
      expected: expected,
      difference: (actualAmounts[method as PaymentMethod] || 0) - expected
    }));

    const totalSales = relevantSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalExpected = Object.values(expectedTotals).reduce((sum, value) => sum + value, 0);
    const totalActual = Object.values(actualAmounts).reduce((sum, value) => sum + value, 0);

    // Atualiza o fechamento
    const closedClosing: CashClosing = {
      ...current,
      closedAt: new Date(),
      payments,
      totalSales,
      totalExpected,
      totalActual,
      difference: totalActual - totalExpected,
      notes,
      status: 'closed'
    };

    // Atualiza o estado
    this.closingHistory.update(history => [...history, closedClosing]);
    this.currentClosing.set(null);

    // Abre um novo fechamento
    this.openNewClosing();

    return closedClosing;
  }

  private calculateExpectedTotals(sales: Sale[]): Record<PaymentMethod, number> {
    const totals: Record<PaymentMethod, number> = {
      cash: 0,
      debit: 0,
      credit: 0,
      transfer: 0,
      qr: 0
    };

    sales.forEach(sale => {
      sale.payments.forEach(payment => {
        totals[payment.method] = (totals[payment.method] || 0) + payment.amount;
      });
    });

    return totals;
  }

  getExpectedAmounts(): Record<PaymentMethod, number> {
    const current = this.currentClosing();
    if (!current) return {} as Record<PaymentMethod, number>;

    const sales = this.saleService.getSales()();
    const relevantSales = sales.filter(sale => 
      sale.status === 'completed' && 
      new Date(sale.date) >= current.openedAt
    );

    return this.calculateExpectedTotals(relevantSales);
  }
} 