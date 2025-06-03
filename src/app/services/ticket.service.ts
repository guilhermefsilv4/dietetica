import { Injectable, signal, computed } from '@angular/core';
import { Sale } from '@interfaces/sale.interface';
import { Ticket } from '@interfaces/ticket.interface';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private storeName = 'La Buena Semilla';
  private tickets = signal<Ticket[]>([]);
  private readonly TTL_DAYS = 30; // Tempo de vida do ticket em dias

  constructor() {
    // Inicializa limpando tickets expirados
    this.cleanExpiredTickets();
    // Agenda limpeza diária
    setInterval(() => this.cleanExpiredTickets(), 24 * 60 * 60 * 1000);
  }

  // Getters
  getTickets = computed(() => this.tickets());
  
  getTicketById(id: string): Ticket | undefined {
    return this.tickets().find(ticket => ticket.id === id);
  }

  getTicketsBySaleId(saleId: string): Ticket[] {
    return this.tickets().filter(ticket => ticket.saleId === saleId);
  }

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

  async printTicket(sale: Sale): Promise<Ticket> {
    const content = this.generateTicketContent(sale);
    
    // Cria novo ticket
    const ticket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      saleId: sale.id,
      content,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.TTL_DAYS * 24 * 60 * 60 * 1000),
      sale,
      printed: false
    };

    // Adiciona ao histórico
    this.tickets.update(tickets => [...tickets, ticket]);
    
    // Mostra o ticket em um modal
    this.showTicketModal(ticket);
    
    // Log para debug
    console.log('Imprimiendo ticket:', ticket.id);
    console.log(content);
    
    return ticket;
  }

  showTicketModal(ticket: Ticket) {
    // Cria o modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      max-width: 400px;
      width: 90%;
    `;

    // Cria o conteúdo do ticket
    const ticketContent = document.createElement('pre');
    ticketContent.style.cssText = `
      white-space: pre-wrap;
      font-family: monospace;
      margin: 0;
      padding: 10px 0;
    `;
    ticketContent.textContent = ticket.content;

    // Adiciona botões
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    `;

    const printButton = document.createElement('button');
    printButton.textContent = 'Imprimir';
    printButton.style.cssText = `
      background: #4CAF50;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    `;
    printButton.onclick = () => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Ticket de Venta</title>
              <style>
                body { font-family: monospace; }
                pre { white-space: pre-wrap; }
              </style>
            </head>
            <body>
              <pre>${ticket.content}</pre>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        
        // Marca como impresso
        this.tickets.update(tickets =>
          tickets.map(t =>
            t.id === ticket.id ? { ...t, printed: true } : t
          )
        );
      }
    };

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cerrar';
    closeButton.style.cssText = `
      background: #f44336;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 10px;
    `;
    closeButton.onclick = () => {
      document.body.removeChild(modal);
      document.body.removeChild(overlay);
    };

    // Cria o overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
    `;

    // Monta a estrutura
    buttonsDiv.appendChild(printButton);
    buttonsDiv.appendChild(closeButton);
    modal.appendChild(ticketContent);
    modal.appendChild(buttonsDiv);
    
    // Adiciona ao documento
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
  }

  private cleanExpiredTickets() {
    const now = new Date();
    this.tickets.update(tickets => 
      tickets.filter(ticket => ticket.expiresAt > now)
    );
  }
} 