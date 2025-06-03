import { Component, EventEmitter, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (show()) {
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
          <h2 class="text-xl font-bold mb-4 text-gray-900">{{ title() }}</h2>
          <p class="text-gray-700 mb-6">{{ message() }}</p>
          
          <div class="flex justify-end gap-4">
            <button
              (click)="onCancel()"
              class="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              {{ cancelText() }}
            </button>
            <button
              (click)="onConfirm()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {{ confirmText() }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmationModalComponent {
  // Inputs como signals
  show = input(false);
  title = input('Confirmar');
  message = input('¿Está seguro que desea continuar?');
  confirmText = input('Confirmar');
  cancelText = input('Cancelar');

  // Outputs como eventos
  confirm = output<void>();
  cancel = output<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
} 