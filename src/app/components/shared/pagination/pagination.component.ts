import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <!-- Mobile -->
      <div class="flex justify-between flex-1 sm:hidden">
        <button
          (click)="onPreviousPage()"
          [disabled]="currentPage() === 1"
          class="pagination-button"
          [class.opacity-50]="currentPage() === 1"
          aria-label="Página anterior"
        >
          Anterior
        </button>
        <button
          (click)="onNextPage()"
          [disabled]="currentPage() === totalPages()"
          class="pagination-button ml-3"
          [class.opacity-50]="currentPage() === totalPages()"
          aria-label="Página siguiente"
        >
          Siguiente
        </button>
      </div>

      <!-- Desktop -->
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Mostrando
            <span class="font-medium">{{ (currentPage() - 1) * pageSize() + 1 }}</span>
            a
            <span class="font-medium">{{ Math.min(currentPage() * pageSize(), totalItems()) }}</span>
            de
            <span class="font-medium">{{ totalItems() }}</span>
            resultados
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              (click)="onPreviousPage()"
              [disabled]="currentPage() === 1"
              class="pagination-button rounded-l-md"
              [class.opacity-50]="currentPage() === 1"
              aria-label="Página anterior"
            >
              <span class="sr-only">Anterior</span>
              <fa-icon [icon]="faChevronLeft" class="h-5 w-5"></fa-icon>
            </button>
            <button
              (click)="onNextPage()"
              [disabled]="currentPage() === totalPages()"
              class="pagination-button rounded-r-md"
              [class.opacity-50]="currentPage() === totalPages()"
              aria-label="Página siguiente"
            >
              <span class="sr-only">Siguiente</span>
              <fa-icon [icon]="faChevronRight" class="h-5 w-5"></fa-icon>
            </button>
          </nav>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pagination-button {
      @apply relative inline-flex items-center px-4 py-2 text-sm font-medium border transition-colors duration-200;
    }

    .pagination-button:not(:disabled) {
      @apply text-gray-700 bg-white border-gray-300 hover:bg-gray-50;
    }

    .pagination-button:disabled {
      @apply text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed;
    }
  `]
})
export class PaginationComponent {
  // Ícones
  protected faChevronLeft = faChevronLeft;
  protected faChevronRight = faChevronRight;
  protected Math = Math;

  // Inputs
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  pageSize = input.required<number>();
  totalItems = input.required<number>();

  // Outputs
  previousPage = output<void>();
  nextPage = output<void>();

  // Event handlers
  onPreviousPage() {
    this.previousPage.emit();
  }

  onNextPage() {
    this.nextPage.emit();
  }
}
