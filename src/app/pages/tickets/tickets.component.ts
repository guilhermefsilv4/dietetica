import { Component, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TicketService } from '@services/ticket.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faReceipt } from '@fortawesome/free-solid-svg-icons';
import { PaginationComponent } from '@components/shared/pagination/pagination.component';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, DatePipe, FontAwesomeModule, PaginationComponent],
  templateUrl: './tickets.component.html'
})
export class TicketsComponent {
  // Ícones
  faReceipt = faReceipt;

  // Estado da paginação
  currentPage = signal(1);
  pageSize = signal(10);

  // Computed properties
  allTickets = computed(() => this.ticketService.getTickets());

  paginatedTickets = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.allTickets().slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.allTickets().length / this.pageSize());
  });

  totalItems = computed(() => {
    return this.allTickets().length;
  });

  constructor(private ticketService: TicketService) {}

  // Métodos de paginação
  onPreviousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  onNextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

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
