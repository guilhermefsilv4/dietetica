import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TicketService } from '@services/ticket.service';
import { Ticket } from '@interfaces/ticket.interface';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './tickets.component.html'
})
export class TicketsComponent {
  tickets = this.ticketService.getTickets;

  constructor(private ticketService: TicketService) {}

  getStatusClass(ticket: Ticket): string {
    return ticket.printed
      ? 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800'
      : 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800';
  }

  showTicket(ticket: Ticket) {
    this.ticketService.showTicketModal(ticket);
  }

  async printTicket(ticket: Ticket) {
    await this.ticketService.printTicket(ticket.sale);
  }
} 