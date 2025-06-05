import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CashClosingService } from '@services/cash-closing.service';
import { PaymentMethod } from '@interfaces/payment.interface';
import { CashClosing } from '@interfaces/cash-closing.interface';
import { ConfirmationModalComponent } from '@components/shared/confirmation-modal/confirmation-modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCashRegister,
  faMoneyBill,
  faCreditCard,
  faQrcode,
  faMobileAlt,
  faHistory,
  faCheck,
  faExclamationTriangle,
  faClockRotateLeft
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-cash-closing',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent, FontAwesomeModule],
  templateUrl: './cash-closing.component.html'
})
export class CashClosingComponent {
  private cashClosingService = inject(CashClosingService);

  // Ícones
  protected faCashRegister = faCashRegister;
  protected faMoneyBill = faMoneyBill;
  protected faCreditCard = faCreditCard;
  protected faQrcode = faQrcode;
  protected faMobileAlt = faMobileAlt;
  protected faHistory = faHistory;
  protected faCheck = faCheck;
  protected faExclamationTriangle = faExclamationTriangle;
  protected faClockRotateLeft = faClockRotateLeft;

  // Estado do modal de confirmação
  showCloseConfirmation = signal(false);

  currentClosing = this.cashClosingService.getCurrentClosing;
  closingHistory = this.cashClosingService.getClosingHistory;

  actualAmounts: Record<PaymentMethod, number> = {
    cash: 0,
    debit: 0,
    credit: 0,
    transfer: 0,
    qr: 0
  };

  notes: string = '';

  getPaymentIcon(method: PaymentMethod) {
    switch (method) {
      case 'cash':
        return this.faMoneyBill;
      case 'debit':
      case 'credit':
        return this.faCreditCard;
      case 'transfer':
        return this.faMobileAlt;
      case 'qr':
        return this.faQrcode;
      default:
        return this.faMoneyBill;
    }
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

  expectedAmountsArray = () => {
    const expected = this.cashClosingService.getExpectedAmounts();
    return Object.entries(expected).map(([method, amount]) => ({
      method: method as PaymentMethod,
      amount
    }));
  };

  totalExpected = () => {
    return this.expectedAmountsArray()
      .reduce((sum, item) => sum + item.amount, 0);
  };

  totalActual = () => {
    return Object.values(this.actualAmounts)
      .reduce((sum, amount) => sum + amount, 0);
  };

  difference = () => {
    return this.totalActual() - this.totalExpected();
  };

  closeRegister() {
    this.showCloseConfirmation.set(true);
  }

  async confirmClose() {
    try {
      await this.cashClosingService.closeCurrentClosing(this.actualAmounts, this.notes);
      this.resetForm();
      this.showCloseConfirmation.set(false);
    } catch (error) {
      console.error('Erro ao fechar caixa:', error);
      // TODO: Mostrar mensagem de erro para o usuário
    }
  }

  cancelClose() {
    this.showCloseConfirmation.set(false);
  }

  private resetForm() {
    this.actualAmounts = {
      cash: 0,
      debit: 0,
      credit: 0,
      transfer: 0,
      qr: 0
    };
    this.notes = '';
  }
}
