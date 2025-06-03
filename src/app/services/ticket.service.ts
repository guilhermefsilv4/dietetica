import { Injectable } from '@angular/core';
import { Sale } from '@interfaces/sale.interface';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private storeName = 'La Buena Semilla';

  constructor() {}

  generateTicketContent(sale: Sale): string {
    const date = new Date(sale.date).toLocaleString('es-AR');
    const items = sale.items.map(item => {
      const name = item.variant ? 
        `${item.product?.name} - ${item.variant.name}` : 
        item.product?.name;
      
      return `${name}
Cantidad: ${item.quantity} x $${item.unitPrice.toFixed(2)}
Subtotal: $${item.subtotal.toFixed(2)}
----------------------------------------`;
    }).join('\n');

    const payments = sale.payments.map(payment => {
      const method = this.getPaymentMethodName(payment.method);
      return `${method}: $${payment.amount.toFixed(2)}`;
    }).join('\n');

    const change = sale.payments
      .reduce((sum, payment) => sum + payment.amount, 0) - sale.total;

    return `
${this.storeName}
----------------------------------------
Fecha: ${date}
----------------------------------------

${items}

----------------------------------------
Subtotal: $${sale.subtotal.toFixed(2)}
Total: $${sale.total.toFixed(2)}

Pagos:
${payments}

${change > 0 ? `Vuelto: $${change.toFixed(2)}` : ''}
----------------------------------------
¡Gracias por su compra!
`;
  }

  private getPaymentMethodName(method: string): string {
    const methods: { [key: string]: string } = {
      'cash': 'Efectivo',
      'debit': 'Tarjeta de Débito',
      'credit': 'Tarjeta de Crédito',
      'transfer': 'Transferencia',
      'qr': 'Pago QR'
    };
    return methods[method] || method;
  }

  async printTicket(sale: Sale) {
    const content = this.generateTicketContent(sale);
    
    // Aqui você pode implementar a integração com a impressora
    // Por enquanto, vamos apenas simular a impressão no console
    console.log('Imprimindo ticket:');
    console.log(content);
    
    return content;
  }
} 