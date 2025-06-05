import { Component, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Customer } from '@interfaces/customer.interface';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faTrash, faUsers } from '@fortawesome/free-solid-svg-icons';
import { TooltipComponent } from '@components/tooltip/tooltip.component';
import { ConfirmationModalComponent } from '@components/shared/confirmation-modal/confirmation-modal.component';
import { PaginationComponent } from '@components/shared/pagination/pagination.component';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, TooltipComponent, ConfirmationModalComponent, PaginationComponent, DatePipe],
  templateUrl: './customers.component.html',
  styles: ``
})
export class CustomersComponent {
  // Ícones
  protected faEdit = faEdit;
  protected faTrash = faTrash;
  protected faUsers = faUsers;

  // Estado do componente
  searchTerm = signal('');
  showModal = signal(false);
  editingCustomer: Customer | null = null;

  // Estado da paginação
  currentPage = signal(1);
  pageSize = signal(10);

  // Estado do modal de confirmação
  showDeleteConfirmation = signal(false);
  customerToDelete = signal<Customer | null>(null);

  customerForm: Partial<Customer> = {
    name: '',
    email: '',
    phone: '',
    address: '',
    document: ''
  };

  // Mock de clientes (em um ambiente real, isso viria de um serviço)
  private mockCustomers: Customer[] = [
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '+54 11 1234-5678',
      address: 'Av. Corrientes 1234, CABA',
      document: '12.345.678',
      createdAt: new Date('2024-01-01'),
      totalPurchases: 5,
      lastPurchaseDate: new Date('2024-03-15')
    }
  ];

  // Computed properties
  filteredCustomers = computed(() => {
    let customers = this.mockCustomers;

    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.document.toLowerCase().includes(term)
      );
    }

    return customers;
  });

  // Computed properties para paginação
  paginatedCustomers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredCustomers().slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredCustomers().length / this.pageSize());
  });

  totalItems = computed(() => {
    return this.filteredCustomers().length;
  });

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

  // Computed para mensagem de confirmação
  deleteConfirmationMessage = computed(() => {
    const customerName = this.customerToDelete()?.name || '';
    return `¿Está seguro que desea eliminar el cliente "${customerName}"?`;
  });

  // Métodos de manipulação do modal
  openCustomerModal(customer?: Customer) {
    if (customer) {
      this.editingCustomer = customer;
      this.customerForm = { ...customer };
    } else {
      this.editingCustomer = null;
      this.customerForm = {
        name: '',
        email: '',
        phone: '',
        address: '',
        document: ''
      };
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingCustomer = null;
    this.customerForm = {
      name: '',
      email: '',
      phone: '',
      address: '',
      document: ''
    };
  }

  isValidCustomer(): boolean {
    return !!(
      this.customerForm.name &&
      this.customerForm.email &&
      this.customerForm.phone &&
      this.customerForm.address &&
      this.customerForm.document
    );
  }

  saveCustomer() {
    if (!this.isValidCustomer()) return;

    if (this.editingCustomer) {
      // Atualiza cliente existente
      const index = this.mockCustomers.findIndex(c => c.id === this.editingCustomer!.id);
      if (index >= 0) {
        this.mockCustomers[index] = {
          ...this.editingCustomer,
          ...this.customerForm
        };
      }
    } else {
      // Cria novo cliente
      const newCustomer: Customer = {
        ...this.customerForm as Customer,
        id: Date.now().toString(),
        createdAt: new Date(),
        totalPurchases: 0
      };
      this.mockCustomers.push(newCustomer);
    }

    this.closeModal();
  }

  deleteCustomer(customer: Customer) {
    this.customerToDelete.set(customer);
    this.showDeleteConfirmation.set(true);
  }

  confirmDelete() {
    if (this.customerToDelete()) {
      const index = this.mockCustomers.findIndex(c => c.id === this.customerToDelete()!.id);
      if (index >= 0) {
        this.mockCustomers.splice(index, 1);
      }
    }
    this.showDeleteConfirmation.set(false);
    this.customerToDelete.set(null);
  }

  cancelDelete() {
    this.showDeleteConfirmation.set(false);
    this.customerToDelete.set(null);
  }
}
