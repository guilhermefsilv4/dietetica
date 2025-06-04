import { Injectable, signal, computed } from '@angular/core';
import { CashClosing, PaymentTotal } from '@interfaces/cash-closing.interface';
import { PaymentMethod } from '@interfaces/payment.interface';
import { HttpService } from './http.service';
import { SaleService } from './sale.service';

@Injectable({
  providedIn: 'root'
})
export class CashClosingService {
  private currentClosing = signal<CashClosing | null>(null);
  private closingHistory = signal<CashClosing[]>([]);

  constructor(
    private http: HttpService,
    private saleService: SaleService
  ) {
    this.loadClosingHistory();
    this.initializeCurrentClosing();
  }

  // Carregar histórico de fechamentos
  private async loadClosingHistory() {
    try {
      const history = await this.http.get<CashClosing[]>('cash-closings');
      this.closingHistory.set(history);
    } catch (error) {
      console.error('Erro ao carregar histórico de fechamentos:', error);
    }
  }

  // Inicializar fechamento atual
  private async initializeCurrentClosing() {
    try {
      // Verificar se existe um fechamento em aberto
      const openClosing = await this.http.get<CashClosing>('cash-closings/current');

      if (openClosing) {
        this.currentClosing.set(openClosing);
      } else {
        // Criar novo fechamento
        const newClosing: CashClosing = {
          id: crypto.randomUUID(),
          openedAt: new Date(),
          closedAt: new Date(),
          payments: [],
          totalSales: 0,
          totalExpected: 0,
          totalActual: 0,
          difference: 0,
          status: 'open'
        };

        const created = await this.http.post<CashClosing>('cash-closings', newClosing);
        this.currentClosing.set(created);
      }
    } catch (error) {
      console.error('Erro ao inicializar fechamento:', error);
    }
  }

  // Getters
  getCurrentClosing = computed(() => this.currentClosing());
  getClosingHistory = computed(() => this.closingHistory());

  // Obter valores esperados por método de pagamento
  getExpectedAmounts(): Record<PaymentMethod, number> {
    const sales = this.saleService.getSales()();
    const currentClosing = this.currentClosing();

    if (!currentClosing) return {
      cash: 0,
      debit: 0,
      credit: 0,
      transfer: 0,
      qr: 0
    };

    // Filtrar vendas desde a abertura do caixa
    const salesInPeriod = sales.filter(sale =>
      new Date(sale.date) >= new Date(currentClosing.openedAt)
    );

    // Agrupar pagamentos por método
    const expectedAmounts: Record<PaymentMethod, number> = {
      cash: 0,
      debit: 0,
      credit: 0,
      transfer: 0,
      qr: 0
    };

    salesInPeriod.forEach(sale => {
      sale.payments.forEach(payment => {
        expectedAmounts[payment.method] += payment.amount;
      });
    });

    return expectedAmounts;
  }

  // Fechar o caixa atual
  async closeCurrentClosing(actualAmounts: Record<PaymentMethod, number>, notes?: string) {
    const current = this.currentClosing();
    if (!current) return;

    const expectedAmounts = this.getExpectedAmounts();
    const payments: PaymentTotal[] = (Object.entries(expectedAmounts) as [PaymentMethod, number][]).map(([method, expected]) => ({
      method,
      total: actualAmounts[method],
      expected,
      difference: actualAmounts[method] - expected
    }));

    const totalExpected = Object.values(expectedAmounts).reduce((sum: number, amount: number) => sum + amount, 0);
    const totalActual = Object.values(actualAmounts).reduce((sum: number, amount: number) => sum + amount, 0);

    const closedClosing: CashClosing = {
      ...current,
      closedAt: new Date(),
      payments,
      totalSales: totalExpected,
      totalExpected,
      totalActual,
      difference: totalActual - totalExpected,
      notes,
      status: 'closed',
      closedBy: 'system' // TODO: Implementar autenticação
    };

    try {
      // Atualizar no backend
      const updated = await this.http.put<CashClosing>(`cash-closings/${current.id}`, closedClosing);

      // Atualizar estado local
      this.closingHistory.update(history => [...history, updated]);
      this.currentClosing.set(null);

      // Iniciar novo fechamento
      await this.initializeCurrentClosing();

      return updated;
    } catch (error) {
      console.error('Erro ao fechar caixa:', error);
      throw error;
    }
  }
}
