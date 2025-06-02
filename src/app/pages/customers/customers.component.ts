import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Customer } from '@interfaces/customer.interface';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TooltipComponent } from '@components/tooltip/tooltip.component';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, TooltipComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header com botão de adicionar -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Clientes</h1>
        <button
          (click)="openCustomerModal()"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Nuevo Cliente
        </button>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              placeholder="Buscar clientes..."
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- Lista de Clientes -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compras</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Compra</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (customer of filteredCustomers(); track customer.id) {
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="ml-4">
                      <app-tooltip [text]="'DNI: ' + customer.document">
                        <div class="text-sm font-medium text-gray-900">{{ customer.name }}</div>
                        <div class="text-sm text-gray-500">{{ customer.document }}</div>
                      </app-tooltip>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <app-tooltip [text]="customer.address">
                    <div class="text-sm text-gray-900">{{ customer.email }}</div>
                    <div class="text-sm text-gray-500">{{ customer.phone }}</div>
                  </app-tooltip>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <app-tooltip text="Total de compras realizadas">
                    {{ customer.totalPurchases }}
                  </app-tooltip>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <app-tooltip text="Fecha de la última compra">
                    {{ customer.lastPurchaseDate | date:'dd/MM/yyyy' }}
                  </app-tooltip>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <app-tooltip text="Editar cliente">
                    <button
                      (click)="openCustomerModal(customer)"
                      class="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <fa-icon [icon]="faEdit"></fa-icon>
                    </button>
                  </app-tooltip>
                  <app-tooltip text="Eliminar cliente">
                    <button
                      (click)="deleteCustomer(customer)"
                      class="text-red-600 hover:text-red-900"
                    >
                      <fa-icon [icon]="faTrash"></fa-icon>
                    </button>
                  </app-tooltip>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal de Cliente -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">
              {{ editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente' }}
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  [(ngModel)]="customerForm.name"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  [(ngModel)]="customerForm.email"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  [(ngModel)]="customerForm.phone"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  [(ngModel)]="customerForm.address"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Documento
                </label>
                <input
                  type="text"
                  [(ngModel)]="customerForm.document"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div class="flex justify-end gap-4 mt-6">
              <button
                (click)="closeModal()"
                class="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                (click)="saveCustomer()"
                [disabled]="!isValidCustomer()"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: ``
})
export class CustomersComponent {
  // Ícones
  faEdit = faEdit;
  faTrash = faTrash;

  // Estado do componente
  searchTerm = signal('');
  showModal = signal(false);
  editingCustomer: Customer | null = null;

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
    if (confirm(`¿Está seguro que desea eliminar el cliente "${customer.name}"?`)) {
      const index = this.mockCustomers.findIndex(c => c.id === customer.id);
      if (index >= 0) {
        this.mockCustomers.splice(index, 1);
      }
    }
  }
} 