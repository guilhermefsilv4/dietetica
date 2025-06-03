import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartOptions } from 'chart.js';
import { ProductService } from '@services/product.service';
import { StockService } from '@services/stock.service';

@Component({
  selector: 'app-stock-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Gráfico de Movimentações de Estoque -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Movimientos de Stock</h3>
        <canvas #stockMovementsChart></canvas>
      </div>

      <!-- Gráfico de Produtos com Estoque Baixo -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Productos con Stock Bajo</h3>
        <canvas #lowStockChart></canvas>
      </div>
    </div>
  `
})
export class StockChartsComponent implements OnInit, AfterViewInit {
  @ViewChild('stockMovementsChart') stockMovementsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lowStockChart') lowStockChartRef!: ElementRef<HTMLCanvasElement>;

  private stockMovementsChart!: Chart;
  private lowStockChart!: Chart;

  constructor(
    private productService: ProductService,
    private stockService: StockService
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // Inicializa os gráficos após a view estar pronta
    setTimeout(() => {
      this.initializeStockMovementsChart();
      this.initializeLowStockChart();
    });
  }

  private initializeStockMovementsChart() {
    const canvas = this.stockMovementsChartRef.nativeElement;
    if (!canvas) return;

    const movements = this.stockService.getStockMovements()();
    const lastWeekMovements = this.getLastWeekMovements(movements);

    const entradas = new Array(7).fill(0);
    const saidas = new Array(7).fill(0);
    const ajustes = new Array(7).fill(0);
    const labels = this.getLastSevenDays();

    lastWeekMovements.forEach(movement => {
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
            data: saidas.map(value => -value), // Valores negativos para mostrar abaixo do eixo
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

    const lowStockProducts = this.productService.getLowStockProducts(20);
    const labels = lowStockProducts.map(p => p.name);
    const data = lowStockProducts.map(p => p.stock);
    const thresholds = lowStockProducts.map(() => 20); // Linha do limite de estoque baixo

    this.lowStockChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Stock Actual',
            data,
            backgroundColor: data.map(stock => 
              stock <= 10 ? 'rgb(239, 68, 68)' : // Vermelho
              stock <= 20 ? 'rgb(234, 179, 8)' : // Amarelo
              'rgb(34, 197, 94)' // Verde
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

  private getLastWeekMovements(movements: any[]) {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    return movements.filter(m => new Date(m.date) >= lastWeek);
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