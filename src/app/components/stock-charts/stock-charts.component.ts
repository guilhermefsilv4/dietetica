import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef, EffectRef, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js';
import { ProductService } from '@services/product.service';
import { StockService } from '@services/stock.service';
import { effect } from '@angular/core';

@Component({
  selector: 'app-stock-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Gráfico de Movimentações de Estoque -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Movimientos de Stock</h3>
        <div class="h-[300px]">
          <canvas #stockMovementsChart></canvas>
        </div>
      </div>

      <!-- Gráfico de Produtos com Estoque Baixo -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Productos con Stock Bajo</h3>
        <div class="h-[300px]">
          <canvas #lowStockChart></canvas>
        </div>
      </div>
    </div>
  `
})
export class StockChartsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stockMovementsChart', { static: true }) stockMovementsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lowStockChart', { static: true }) lowStockChartRef!: ElementRef<HTMLCanvasElement>;

  private stockMovementsChart!: Chart;
  private lowStockChart!: Chart;
  private chartsInitialized = signal(false);
  private destroyEffect: EffectRef | null = null;

  // Dados reativos
  private movements = computed(() => this.stockService.getStockMovementsDb());
  private products = computed(() => this.productService.getProductsDb()());
  private lowStockProducts = computed(() => this.productService.getLowStockProductsDb(20));

  // Dados processados
  private lastWeekMovements = computed(() => {
    const movements = this.movements();
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    return movements.filter(m => new Date(m.date) >= lastWeek);
  });

  private movementsByDay = computed(() => {
    const entradas = new Array(7).fill(0);
    const saidas = new Array(7).fill(0);
    const ajustes = new Array(7).fill(0);

    this.lastWeekMovements().forEach(movement => {
      const dayIndex = 6 - this.getDaysDifference(new Date(movement.date), new Date());
      if (dayIndex >= 0 && dayIndex < 7) {
        switch (movement.type) {
          case 'entrada':
            entradas[dayIndex] += movement.quantity;
            break;
          case 'salida':
            saidas[dayIndex] += movement.quantity;
            break;
          case 'ajuste':
            ajustes[dayIndex] += movement.quantity;
            break;
        }
      }
    });

    return { entradas, saidas, ajustes };
  });

  constructor(
    private productService: ProductService,
    private stockService: StockService,
    private cdr: ChangeDetectorRef
  ) {
    // Efeito para atualizar os gráficos quando os dados mudarem
    this.destroyEffect = effect(() => {
      // Observa mudanças nos dados computados
      this.movements();
      this.products();
      this.lowStockProducts();
      this.movementsByDay();

      // Se os gráficos já foram inicializados, atualiza-os
      if (this.chartsInitialized()) {
        this.updateCharts();
      }
    });
  }

  ngOnInit() {
    // Inicializa os gráficos imediatamente já que os ViewChild são static: true
    this.initializeCharts();
    this.chartsInitialized.set(true);
  }

  ngAfterViewInit() {
    // Força uma atualização do CD após a view estar pronta
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    // Limpa os gráficos e o efeito ao destruir o componente
    if (this.stockMovementsChart) {
      this.stockMovementsChart.destroy();
    }
    if (this.lowStockChart) {
      this.lowStockChart.destroy();
    }
    if (this.destroyEffect) {
      this.destroyEffect.destroy();
    }
  }

  private initializeCharts() {
    this.initializeStockMovementsChart();
    this.initializeLowStockChart();
  }

  private updateCharts() {
    this.updateStockMovementsChart();
    this.updateLowStockChart();
  }

  private updateStockMovementsChart() {
    if (!this.stockMovementsChart) return;

    const { entradas, saidas, ajustes } = this.movementsByDay();
    const labels = this.getLastSevenDays();

    this.stockMovementsChart.data.labels = labels;
    this.stockMovementsChart.data.datasets = [
      {
        label: 'Entradas',
        data: entradas,
        backgroundColor: 'rgb(34, 197, 94)',
        stack: 'Stack 0'
      },
      {
        label: 'Salidas',
        data: saidas.map(value => -value),
        backgroundColor: 'rgb(239, 68, 68)',
        stack: 'Stack 0'
      },
      {
        label: 'Ajustes',
        data: ajustes,
        backgroundColor: 'rgb(234, 179, 8)',
        stack: 'Stack 1'
      }
    ];

    this.stockMovementsChart.update('none'); // Modo mais rápido de atualização
  }

  private updateLowStockChart() {
    if (!this.lowStockChart) return;

    const lowStockProducts = this.lowStockProducts();
    const labels = lowStockProducts.map(p => p.name);
    const data = lowStockProducts.map(p => p.stock);
    const thresholds = lowStockProducts.map(() => 20);

    this.lowStockChart.data.labels = labels;
    this.lowStockChart.data.datasets = [
      {
        label: 'Stock Actual',
        data,
        backgroundColor: data.map(stock =>
          stock <= 10 ? 'rgb(239, 68, 68)' :
          stock <= 20 ? 'rgb(234, 179, 8)' :
          'rgb(34, 197, 94)'
        )
      },
      {
        label: 'Límite de Stock Bajo',
        data: thresholds,
        type: 'line',
        borderColor: 'rgb(239, 68, 68)',
        borderDash: [5, 5],
        fill: false
      }
    ];

    this.lowStockChart.update('none'); // Modo mais rápido de atualização
  }

  private initializeStockMovementsChart() {
    const canvas = this.stockMovementsChartRef.nativeElement;
    if (!canvas) return;

    const { entradas, saidas, ajustes } = this.movementsByDay();
    const labels = this.getLastSevenDays();

    this.stockMovementsChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Entradas',
            data: entradas,
            backgroundColor: 'rgb(34, 197, 94)',
            stack: 'Stack 0'
          },
          {
            label: 'Salidas',
            data: saidas.map(value => -value),
            backgroundColor: 'rgb(239, 68, 68)',
            stack: 'Stack 0'
          },
          {
            label: 'Ajustes',
            data: ajustes,
            backgroundColor: 'rgb(234, 179, 8)',
            stack: 'Stack 1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: {
          duration: 300 // Animações mais rápidas
        },
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true
          }
        }
      }
    });
  }

  private initializeLowStockChart() {
    const canvas = this.lowStockChartRef.nativeElement;
    if (!canvas) return;

    const lowStockProducts = this.lowStockProducts();
    const labels = lowStockProducts.map(p => p.name);
    const data = lowStockProducts.map(p => p.stock);
    const thresholds = lowStockProducts.map(() => 20);

    this.lowStockChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Stock Actual',
            data,
            backgroundColor: data.map(stock =>
              stock <= 10 ? 'rgb(239, 68, 68)' :
              stock <= 20 ? 'rgb(234, 179, 8)' :
              'rgb(34, 197, 94)'
            )
          },
          {
            label: 'Límite de Stock Bajo',
            data: thresholds,
            type: 'line',
            borderColor: 'rgb(239, 68, 68)',
            borderDash: [5, 5],
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: {
          duration: 300 // Animações mais rápidas
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cantidad en Stock'
            }
          }
        }
      }
    });
  }

  private getLastSevenDays(): string[] {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('es-AR', { weekday: 'short' }));
    }
    return days;
  }

  private getDaysDifference(date1: Date, date2: Date): number {
    const diff = date2.getTime() - date1.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
