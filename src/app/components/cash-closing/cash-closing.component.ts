import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CashClosingService } from '@services/cash-closing.service';
import { PaymentMethod } from '@interfaces/payment.interface';
import { CashClosing } from '@interfaces/cash-closing.interface';
import { ConfirmationModalComponent } from '@components/shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-cash-closing',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './cash-closing.component.html'
})
export class CashClosingComponent {
  private cashClosingService = inject(CashClosingService);

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
    await this.cashClosingService.closeCurrentClosing(this.actualAmounts, this.notes);
    this.resetForm();
    this.showCloseConfirmation.set(false);
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