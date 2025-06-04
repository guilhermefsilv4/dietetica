import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '@services/product.service';
import { StockService } from '@services/stock.service';
import { ProductCardComponent } from '@components/product-card/product-card.component';
import { StockChartsComponent } from '@components/stock-charts/stock-charts.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBoxesStacked } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, StockChartsComponent, FontAwesomeModule],
  templateUrl: './dashboard.component.html',
  styles: ``
})
export class DashboardComponent {
  // Ícones
  faBoxesStacked = faBoxesStacked;

  constructor(
    private productService: ProductService,
    private stockService: StockService
  ) {}

  // Métricas
  totalProducts = computed(() => this.productService.getProductsDb()().length);

  lowStockProducts = computed(() =>
    this.productService.getLowStockProductsDb(20)
  );

  lowStockCount = computed(() => this.lowStockProducts().length);

  recentMovements = computed(() => this.stockService.getRecentMovementsDb(10));

  todayMovements = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.stockService.getStockMovementsDb().filter(movement => {
      const movementDate = new Date(movement.date);
      movementDate.setHours(0, 0, 0, 0);
      return movementDate.getTime() === today.getTime();
    }).length;
  });

  // Helpers
  getProductName(productId: string): string {
    const product = this.productService.getProductByIdDb(productId);
    return product?.name || 'Producto no encontrado';
  }

  getMovementTypeClass(type: string): string {
    const baseClass = 'px-2 py-1 text-xs font-medium rounded-full';
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
}
