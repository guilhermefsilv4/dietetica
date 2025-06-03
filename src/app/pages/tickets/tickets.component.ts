import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TicketService } from '@services/ticket.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faReceipt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, DatePipe, FontAwesomeModule],
  templateUrl: './tickets.component.html'
})
export class TicketsComponent {
  // Ícones
  faReceipt = faReceipt;

  tickets = this.ticketService.getTickets;

  constructor(private ticketService: TicketService) {}

  getStatusClass(ticket: any): string {
    return ticket.printed
      ? 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800'
      : 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800';
  }

  showTicket(ticket: any) {
    this.ticketService.showTicketModal(ticket);
  }

  async printTicket(ticket: any) {
    await this.ticketService.printTicket(ticket.sale);
  }
}
