import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '@services/product.service';
import { Product } from '@interfaces/product.interface';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faTrash, faSearch, faClipboard, faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import { TooltipComponent } from '@components/tooltip/tooltip.component';
import { ConfirmationModalComponent } from '@components/shared/confirmation-modal/confirmation-modal.component';
import { PaginationComponent } from '@components/shared/pagination/pagination.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, TooltipComponent, ConfirmationModalComponent, PaginationComponent],
  templateUrl: './products.component.html',
  styles: [`
    .copy-button {
      @apply opacity-0 text-gray-400 hover:text-blue-600 transition-all duration-200 p-1 rounded-full hover:bg-blue-50;
    }

    .copied {
      @apply text-green-500 bg-green-50;
    }
  `]
})
export class ProductsComponent {
  // Ícones
  protected faEdit = faEdit;
  protected faTrash = faTrash;
  protected faSearch = faSearch;
  protected faClipboard = faClipboard;
  protected faClipboardCheck = faClipboardCheck;

  // Estado do componente
  searchTerm = signal('');
  selectedCategory = signal('');
  showModal = signal(false);
  editingProduct: Product | null = null;

  // Estado da paginação
  currentPage = signal(1);
  pageSize = signal(10);

  // Estado do modal de confirmação
  showDeleteConfirmation = signal(false);
  productToDelete = signal<Product | null>(null);

  // Estado de cópia
  private copiedBarcode = signal<string | null>(null);

  productForm: Partial<Product> = {
    name: '',
    brand: '',
    category: '',
    description: '',
    price: 0,
    stock: 0,
    minStock: 0,
    barcode: '',
    saleType: 'unit',
    imageUrl: ''
  };

  constructor(private productService: ProductService) {}

  // Computed properties
  categories = computed(() => {
    const products = this.productService.getProductsDb()();
    return [...new Set(products.map(p => p.category))].sort();
  });

  filteredProducts = computed(() => {
    let products = this.productService.getProductsDb()();

    // Filtrar por termo de busca
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.barcode?.toLowerCase().includes(term) // Busca parcial por código de barras
      );
    }

    // Filtrar por categoria
    if (this.selectedCategory()) {
      products = products.filter(p => p.category === this.selectedCategory());
    }

    return products;
  });

  // Computed properties para paginação
  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredProducts().slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredProducts().length / this.pageSize());
  });

  totalItems = computed(() => {
    return this.filteredProducts().length;
  });

  // Computed para mensagem de confirmação
  deleteConfirmationMessage = computed(() => {
    const productName = this.productToDelete()?.name || '';
    return `Tem certeza que deseja excluir o produto "${productName}"?`;
  });

  // Métodos auxiliares
  getStockClass(stock: number): string {
    if (stock <= 10) {
      return 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800';
    } else if (stock <= 20) {
      return 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800';
    } else {
      return 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800';
    }
  }

  getStockTooltip(stock: number): string {
    if (stock <= 10) {
      return 'Estoque crítico';
    } else if (stock <= 20) {
      return 'Estoque baixo';
    } else {
      return 'Estoque normal';
    }
  }

  // Métodos de manipulação do modal
  async openProductModal(product?: Product) {
    if (product) {
      this.editingProduct = product;
      this.productForm = { ...product };
    } else {
      this.editingProduct = null;
      this.productForm = {
        name: '',
        brand: '',
        category: '',
        description: '',
        price: 0,
        stock: 0,
        minStock: 0,
        barcode: '',
        saleType: 'unit',
        imageUrl: ''
      };
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingProduct = null;
    this.productForm = {
      name: '',
      brand: '',
      category: '',
      description: '',
      price: 0,
      stock: 0,
      minStock: 0,
      barcode: '',
      saleType: 'unit',
      imageUrl: ''
    };
  }

  isValidProduct(): boolean {
    return !!(
      this.productForm.name &&
      this.productForm.brand &&
      this.productForm.category &&
      this.productForm.description &&
      this.productForm.price &&
      this.productForm.barcode &&
      this.productForm.saleType &&
      this.productForm.minStock &&
      (this.editingProduct || this.productForm.stock) &&
      this.productForm.imageUrl &&
      (this.productForm.saleType !== 'weight' || this.productForm.weightUnit)
    );
  }

  async saveProduct() {
    if (!this.isValidProduct()) {
      return;
    }

    try {
      if (this.editingProduct) {
        await this.productService.updateProductDb(this.editingProduct.id, this.productForm as Product);
      } else {
        await this.productService.addProductDb(this.productForm as Product);
      }
      this.closeModal();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  }

  async deleteProduct(product: Product) {
    this.productToDelete.set(product);
    this.showDeleteConfirmation.set(true);
  }

  async confirmDelete() {
    try {
      if (this.productToDelete()) {
        await this.productService.deleteProductDb(this.productToDelete()!.id);
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    } finally {
      this.showDeleteConfirmation.set(false);
      this.productToDelete.set(null);
    }
  }

  cancelDelete() {
    this.showDeleteConfirmation.set(false);
    this.productToDelete.set(null);
  }

  // Métodos de paginação
  onPreviousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  onNextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  // Métodos de cópia de código de barras
  async copyBarcode(barcode: string, event: Event) {
    event.stopPropagation(); // Previne a propagação do evento

    try {
      await navigator.clipboard.writeText(barcode);
      this.copiedBarcode.set(barcode);

      // Reset do estado após 2 segundos
      setTimeout(() => {
        this.copiedBarcode.set(null);
      }, 2000);
    } catch (err) {
      console.error('Erro ao copiar código de barras:', err);
    }
  }

  isCopied(barcode: string): boolean {
    return this.copiedBarcode() === barcode;
  }
}
