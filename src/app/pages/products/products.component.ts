import { Component, computed, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '@services/product.service';
import { ExportService } from '@services/export.service';
import { Product } from '@interfaces/product.interface';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faEdit,
  faTrash,
  faSearch,
  faClipboard,
  faClipboardCheck,
  faDownload,
  faChevronDown,
  faFileCsv,
  faFileExcel
} from '@fortawesome/free-solid-svg-icons';
import { TooltipComponent } from '@components/tooltip/tooltip.component';
import { ConfirmationModalComponent } from '@components/shared/confirmation-modal/confirmation-modal.component';
import { PaginationComponent } from '@components/shared/pagination/pagination.component';
import { FieldErrorComponent } from '../../components/field-error/field-error.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, TooltipComponent, ConfirmationModalComponent, PaginationComponent, FieldErrorComponent],
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
  protected faDownload = faDownload;
  protected faChevronDown = faChevronDown;
  protected faFileCsv = faFileCsv;
  protected faFileExcel = faFileExcel;

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

  // Estado do dropdown de exportação
  showExportDropdown = signal(false);

  // Estado de validação - para mostrar erros após tentar salvar
  showValidationErrors = signal(false);

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

  constructor(
    private productService: ProductService,
    private exportService: ExportService
  ) {}

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
    this.showValidationErrors.set(false); // Reset validation errors

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
    this.showValidationErrors.set(false); // Reset validation errors
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
      (this.productForm.saleType !== 'weight' || this.productForm.weightUnit)
    );
  }

  getValidationMessages(): string[] {
    const messages: string[] = [];

    if (!this.productForm.name || this.productForm.name.trim() === '') {
      messages.push('El nombre del producto es obligatorio');
    }

    if (!this.productForm.brand || this.productForm.brand.trim() === '') {
      messages.push('El proveedor es obligatorio');
    }

    if (!this.productForm.category || this.productForm.category.trim() === '') {
      messages.push('El rubro es obligatorio');
    }

    if (!this.productForm.description || this.productForm.description.trim() === '') {
      messages.push('La descripción es obligatoria');
    }

    if (!this.productForm.barcode || this.productForm.barcode.trim() === '') {
      messages.push('El código de barras es obligatorio');
    }

    if (!this.productForm.price || this.productForm.price <= 0) {
      messages.push('El precio debe ser mayor a cero');
    }

    if (!this.productForm.minStock || this.productForm.minStock < 0) {
      messages.push('El stock mínimo debe ser mayor o igual a cero');
    }

    if (!this.editingProduct && (!this.productForm.stock || this.productForm.stock < 0)) {
      messages.push('El stock inicial debe ser mayor o igual a cero');
    }

    if (this.productForm.saleType === 'weight' && !this.productForm.weightUnit) {
      messages.push('Debés seleccionar la unidad de peso para productos vendidos por peso');
    }

    return messages;
  }

  // Funções para validar campos específicos
  getFieldError(field: string): string | null {
    if (!this.showValidationErrors()) return null;

    switch (field) {
      case 'name':
        if (!this.productForm.name || this.productForm.name.trim() === '') {
          return 'El nombre del producto es obligatorio';
        }
        break;

      case 'brand':
        if (!this.productForm.brand || this.productForm.brand.trim() === '') {
          return 'El proveedor es obligatorio';
        }
        break;

      case 'category':
        if (!this.productForm.category || this.productForm.category.trim() === '') {
          return 'El rubro es obligatorio';
        }
        break;

      case 'description':
        if (!this.productForm.description || this.productForm.description.trim() === '') {
          return 'La descripción es obligatoria';
        }
        break;

      case 'barcode':
        if (!this.productForm.barcode || this.productForm.barcode.trim() === '') {
          return 'El código de barras es obligatorio';
        }
        break;

      case 'price':
        if (!this.productForm.price || this.productForm.price <= 0) {
          return 'El precio debe ser mayor a cero';
        }
        break;

      case 'stock':
        if (!this.editingProduct && (!this.productForm.stock || this.productForm.stock < 0)) {
          return 'El stock inicial debe ser mayor o igual a cero';
        }
        break;

      case 'minStock':
        if (!this.productForm.minStock || this.productForm.minStock < 0) {
          return 'El stock mínimo debe ser mayor o igual a cero';
        }
        break;

      case 'weightUnit':
        if (this.productForm.saleType === 'weight' && !this.productForm.weightUnit) {
          return 'Debés seleccionar la unidad de peso';
        }
        break;
    }

    return null;
  }

  // Método para limpar erros quando usuário começar a digitar
  onFieldChange() {
    this.showValidationErrors.set(false);
  }

  // Opções para selects
  saleTypeOptions = [
    { value: 'unit', label: 'Por Unidad' },
    { value: 'weight', label: 'Por Peso' }
  ];

  weightUnitOptions = [
    { value: 'kg', label: 'Kilogramos (kg)' },
    { value: 'g', label: 'Gramos (g)' }
  ];

  async saveProduct() {
    // Ativa a exibição de erros de validação
    this.showValidationErrors.set(true);

    // Verifica se o produto é válido
    if (!this.isValidProduct()) {
      return; // Para aqui se inválido, mas os erros já estão sendo mostrados
    }

    try {
      // Se não foi fornecida uma URL de imagem, usar a imagem padrão
      const productData = { ...this.productForm };
      if (!productData.imageUrl || productData.imageUrl.trim() === '') {
        productData.imageUrl = 'assets/sinimagen.jpg';
      }

      if (this.editingProduct) {
        await this.productService.updateProductDb(this.editingProduct.id, productData as Product);
      } else {
        await this.productService.addProductDb(productData as Product);
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

  // Listener para fechar dropdown ao clicar fora
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showExportDropdown.set(false);
    }
  }

  // Métodos de exportação
  toggleExportDropdown() {
    this.showExportDropdown.update(show => !show);
  }

  exportAllToCSV() {
    const allProducts = this.productService.getProductsDb()();
    this.exportService.exportToCSV(allProducts, 'todos_los_productos');
    this.showExportDropdown.set(false);
  }

  exportAllToExcel() {
    const allProducts = this.productService.getProductsDb()();
    this.exportService.exportToExcel(allProducts, 'todos_los_productos');
    this.showExportDropdown.set(false);
  }

  exportFilteredToCSV() {
    const filtered = this.filteredProducts();
    if (filtered.length === 0) return;

    this.exportService.exportFilteredToCSV(filtered, 'productos_filtrados');
    this.showExportDropdown.set(false);
  }

  exportFilteredToExcel() {
    const filtered = this.filteredProducts();
    if (filtered.length === 0) return;

    this.exportService.exportFilteredToExcel(filtered, 'productos_filtrados');
    this.showExportDropdown.set(false);
  }

  exportTemplate(format: 'csv' | 'excel') {
    this.exportService.exportTemplate(format);
    this.showExportDropdown.set(false);
  }
}
