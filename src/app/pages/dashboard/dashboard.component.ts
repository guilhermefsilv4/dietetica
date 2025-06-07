import { Component, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '@services/product.service';
import { StockService } from '@services/stock.service';
import { ProductCardComponent } from '@components/product-card/product-card.component';
import { StockChartsComponent } from '@components/stock-charts/stock-charts.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PaginationComponent } from '@components/shared/pagination/pagination.component';
import { Product } from '@interfaces/product.interface';
import { FormsModule } from '@angular/forms';
import { ConfirmationModalComponent } from '@components/shared/confirmation-modal/confirmation-modal.component';
import { StockMovementType } from '@interfaces/stock-movement.interface';
import {
  faBoxesStacked,
  faChevronLeft,
  faChevronRight,
  faSpinner,
  faExclamationTriangle,
  faArrowUp,
  faArrowDown,
  faSync,
  faClipboard,
  faClipboardCheck
} from '@fortawesome/free-solid-svg-icons';
import { StockMovement } from '@interfaces/stock-movement.interface';
import { TooltipComponent } from '@components/tooltip/tooltip.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardComponent,
    StockChartsComponent,
    FontAwesomeModule,
    PaginationComponent,
    TooltipComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .skeleton {
      @apply animate-pulse bg-gray-200 rounded;
    }

    .movement-row {
      @apply hover:bg-gray-50 transition-colors duration-200;
    }

    .pagination-button {
      @apply relative inline-flex items-center px-4 py-2 text-sm font-medium border rounded-md transition-colors duration-200;
    }

    .pagination-button:not(:disabled) {
      @apply text-gray-700 bg-white border-gray-300 hover:bg-gray-50;
    }

    .pagination-button:disabled {
      @apply text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed;
    }

    .copy-button {
      @apply opacity-0 text-gray-400 hover:text-blue-600 transition-all duration-200 p-1 rounded-full hover:bg-blue-50;
    }

    .copied {
      @apply text-green-500 bg-green-50;
    }
  `]
})
export class DashboardComponent {
  // Referência ao Math para usar no template
  protected Math = Math;

  // Ícones
  protected faBoxesStacked = faBoxesStacked;
  protected faChevronLeft = faChevronLeft;
  protected faChevronRight = faChevronRight;
  protected faSpinner = faSpinner;
  protected faExclamationTriangle = faExclamationTriangle;
  protected faArrowUp = faArrowUp;
  protected faArrowDown = faArrowDown;
  protected faSync = faSync;
  protected faClipboard = faClipboard;
  protected faClipboardCheck = faClipboardCheck;

  // Estados
  private isLoading = signal(true);
  private hasError = signal(false);
  private errorMessage = signal('');

  // Estado do modal
  showModal = signal(false);
  showDeleteConfirmation = signal(false);
  productToDelete = signal<Product | null>(null);

  // Estado do modal de movimentação
  selectedProduct: Product | null = null;
  selectedMovementType: StockMovementType | null = null;
  movementQuantity = 0;
  movementDescription = '';

  // Paginação para movimentos
  currentPage = signal(1);
  pageSize = signal(10);
  private movementsData = computed(() =>
    this.stockService.getRecentMovementsDb(this.currentPage(), this.pageSize())
  );

  recentMovements = computed(() => this.movementsData().movements);
  totalPages = computed(() => this.movementsData().totalPages);
  totalItems = computed(() => this.movementsData().total || 0);

  // Paginação para produtos com stock baixo
  lowStockCurrentPage = signal(1);
  lowStockPageSize = signal(3); // 3 cards por página (1 linha de 3 cards)

  private allLowStockProducts = computed(() =>
    this.productService.getLowStockProductsDb(20)
  );

  paginatedLowStockProducts = computed(() => {
    const products = this.allLowStockProducts();
    const start = (this.lowStockCurrentPage() - 1) * this.lowStockPageSize();
    const end = start + this.lowStockPageSize();
    return products.slice(start, end);
  });

  lowStockTotalPages = computed(() => {
    return Math.ceil(this.allLowStockProducts().length / this.lowStockPageSize());
  });

  lowStockTotalItems = computed(() => this.allLowStockProducts().length);

  // Cache de produtos
  private productsMap = computed(() => {
    const products = this.productService.getProductsDb()();
    const map = new Map();
    products.forEach(product => {
      map.set(product.id, {
        name: product.name,
        barcode: product.barcode
      });
    });
    return map;
  });

  // Estado de feedback da cópia
  private copiedProductId = signal<string | null>(null);

  constructor(
    private productService: ProductService,
    private stockService: StockService
  ) {
    this.loadData();
  }

  // Track by functions
  protected trackById(index: number, item: any): string {
    return item.id;
  }

  protected trackByIndex(index: number): number {
    return index;
  }

  private async loadData() {
    try {
      this.isLoading.set(true);
      this.hasError.set(false);
      await Promise.all([
        this.productService.loadProductsDb(),
        this.stockService.loadStockMovementsDb()
      ]);
    } catch (error) {
      this.hasError.set(true);
      this.errorMessage.set('Error al cargar los datos. Por favor, intente nuevamente.');
      console.error('Erro ao carregar dados:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async refreshData() {
    await this.loadData();
  }

  // Métricas
  totalProducts = computed(() => this.productService.getProductsDb()().length);

  lowStockProducts = computed(() => this.paginatedLowStockProducts());

  lowStockCount = computed(() => this.allLowStockProducts().length);

  todayMovements = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.stockService.getStockMovementsDb().filter(movement => {
      const movementDate = new Date(movement.date);
      movementDate.setHours(0, 0, 0, 0);
      return movementDate.getTime() === today.getTime();
    }).length;
  });

  // Paginação para movimentos
  onNextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  onPreviousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  // Paginação para produtos com stock baixo
  onLowStockNextPage() {
    if (this.lowStockCurrentPage() < this.lowStockTotalPages()) {
      this.lowStockCurrentPage.update(page => page + 1);
    }
  }

  onLowStockPreviousPage() {
    if (this.lowStockCurrentPage() > 1) {
      this.lowStockCurrentPage.update(page => page - 1);
    }
  }

  // Helpers
  getProductName(productId: string): string {
    return this.productsMap()?.get(productId)?.name || 'Producto no encontrado';
  }

  getProductBarcode(productId: string): string {
    return this.productsMap()?.get(productId)?.barcode || '';
  }

  getMovementTypeClass(type: string): string {
    const baseClass = 'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full gap-1';
    switch (type) {
      case 'entrada':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'salida':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'ajuste':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      default:
        return baseClass;
    }
  }

  getMovementTypeIcon(type: string) {
    switch (type) {
      case 'entrada':
        return this.faArrowUp;
      case 'salida':
        return this.faArrowDown;
      case 'ajuste':
        return this.faSync;
      default:
        return this.faArrowUp;
    }
  }

  // Estados
  isLoadingState = computed(() => this.isLoading());
  hasErrorState = computed(() => this.hasError());
  errorMessageState = computed(() => this.errorMessage());

  // Métodos de cópia de código de barras
  async copyBarcode(productId: string, event: Event) {
    event.stopPropagation();
    const barcode = this.getProductBarcode(productId);

    try {
      await navigator.clipboard.writeText(barcode);
      this.copiedProductId.set(productId);

      setTimeout(() => {
        this.copiedProductId.set(null);
      }, 2000);
    } catch (err) {
      console.error('Erro ao copiar código de barras:', err);
    }
  }

  isCopied(productId: string): boolean {
    return this.copiedProductId() === productId;
  }

  // Métodos de manipulação do modal de movimentação
  openMovementModal(product: Product, type: StockMovementType) {
    this.selectedProduct = product;
    this.selectedMovementType = type;
    this.movementQuantity = 0;
    this.movementDescription = '';
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedProduct = null;
    this.selectedMovementType = null;
    this.movementQuantity = 0;
    this.movementDescription = '';
  }

  isValidMovement(): boolean {
    return !!(
      this.selectedProduct &&
      this.selectedMovementType &&
      this.movementQuantity > 0 &&
      this.movementDescription.trim()
    );
  }

  async saveMovement() {
    if (!this.selectedProduct || !this.selectedMovementType || !this.isValidMovement()) {
      return;
    }

    try {
      await this.stockService.addStockMovementDb(
        this.selectedProduct.id,
        this.selectedMovementType,
        this.movementQuantity,
        this.movementDescription
      );

      // Atualiza a lista de movimentações
      await this.stockService.loadStockMovementsDb();

      this.closeModal();
      // TODO: Adicionar um componente de toast/notificação para feedback
      console.log('Movimentação registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      // TODO: Adicionar um componente de toast/notificação para erros
      alert('Erro ao registrar movimentação. Por favor, tente novamente.');
    }
  }

  getMovementTitle(type: StockMovementType | null): string {
    switch (type) {
      case 'entrada':
        return 'Registrar Entrada';
      case 'salida':
        return 'Registrar Salida';
      case 'ajuste':
        return 'Ajustar Stock';
      default:
        return 'Movimiento de Stock';
    }
  }

  // Métodos de exclusão
  async deleteProduct(productId: string) {
    const product = this.productService.getProductsDb()().find(p => p.id === productId);
    if (product) {
      this.productToDelete.set(product);
      this.showDeleteConfirmation.set(true);
    }
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

  // Computed para mensagem de confirmação
  deleteConfirmationMessage = computed(() => {
    const productName = this.productToDelete()?.name || '';
    return `Tem certeza que deseja excluir o produto "${productName}"?`;
  });
}
