import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '@services/product.service';
import { StockService } from '@services/stock.service';
import { Product } from '@interfaces/product.interface';
import { StockMovementType } from '@interfaces/stock-movement.interface';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowUp,
  faArrowDown,
  faSliders,
  faBoxesStacked,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { TooltipComponent } from '@components/tooltip/tooltip.component';
import { PaginationComponent } from '@components/shared/pagination/pagination.component';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    TooltipComponent,
    PaginationComponent
  ],
  templateUrl: './stock.component.html',
  styles: ``
})
export class StockComponent {
  // Ícones
  protected faArrowUp = faArrowUp;
  protected faArrowDown = faArrowDown;
  protected faSliders = faSliders;
  protected faBoxesStacked = faBoxesStacked;
  protected faSearch = faSearch;

  // Estado do componente
  searchTerm = signal('');
  selectedCategory = signal('');
  showModal = signal(false);
  selectedProduct: Product | null = null;
  selectedMovementType: StockMovementType | null = null;
  movementQuantity = 0;
  movementDescription = '';

  // Estado da paginação
  currentPage = signal(1);
  pageSize = signal(10);

  constructor(
    private productService: ProductService,
    private stockService: StockService
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
        p.barcode?.toLowerCase() === term // Busca exata por código de barras
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

  getStockTooltip(stock: number): string {
    if (stock <= 10) {
      return 'Stock crítico';
    } else if (stock <= 20) {
      return 'Stock bajo';
    } else {
      return 'Stock normal';
    }
  }

  // Métodos de manipulação do modal
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
}
