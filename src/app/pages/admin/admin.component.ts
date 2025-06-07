import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '@app/services/product.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrashCan, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div class="flex items-center mb-4">
            <fa-icon [icon]="faExclamationTriangle" class="text-red-500 text-2xl mr-3"></fa-icon>
            <h1 class="text-2xl font-bold text-red-800">Área Administrativa - PERIGOSO</h1>
          </div>
          <p class="text-red-700 mb-4">
            Esta área permite operações perigosas que podem apagar dados permanentemente.
            Use com extrema cautela!
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <fa-icon [icon]="faTrashCan" class="mr-2 text-red-500"></fa-icon>
            Limpar Tabela de Produtos
          </h2>

          <div class="space-y-4">
            <div class="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p class="text-yellow-800 font-medium">
                ⚠️ Esta operação irá apagar TODOS os produtos do banco de dados permanentemente!
              </p>
              <p class="text-yellow-700 text-sm mt-2">
                Isso também afetará vendas, movimentações de estoque e outros dados relacionados.
              </p>
            </div>

            @if (!step1Confirmed()) {
              <div>
                <label class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    [(ngModel)]="confirmStep1"
                    class="w-4 h-4 text-red-600"
                  >
                  <span class="text-gray-700">
                    Eu entendo que esta operação é IRREVERSÍVEL
                  </span>
                </label>
              </div>

              <button
                (click)="confirmStep1Action()"
                [disabled]="!confirmStep1"
                class="w-full py-2 px-4 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continuar (Passo 1 de 3)
              </button>
            }

            @if (step1Confirmed() && !step2Confirmed()) {
              <div>
                <p class="text-gray-700 mb-2">Digite exatamente: <strong class="text-red-600">APAGAR TODOS OS PRODUTOS</strong></p>
                <input
                  type="text"
                  [(ngModel)]="confirmationText"
                  placeholder="Digite a frase de confirmação"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
              </div>

              <button
                (click)="confirmStep2Action()"
                [disabled]="confirmationText !== 'APAGAR TODOS OS PRODUTOS'"
                class="w-full py-2 px-4 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continuar (Passo 2 de 3)
              </button>
            }

            @if (step2Confirmed() && !step3Confirmed()) {
              <div>
                <p class="text-gray-700 mb-2">
                  Última confirmação - Esta é sua última chance de cancelar!
                </p>
                <p class="text-red-600 font-bold mb-4">
                  Você está prestes a apagar {{ totalProducts() }} produtos do banco de dados.
                </p>
                <label class="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    [(ngModel)]="finalConfirmation"
                    class="w-4 h-4 text-red-600"
                  >
                  <span class="text-gray-700">
                    SIM, eu quero apagar TODOS os produtos permanentemente
                  </span>
                </label>
              </div>

              <button
                (click)="executeCleanup()"
                [disabled]="!finalConfirmation || isLoading()"
                class="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                @if (isLoading()) {
                  <span>Apagando produtos...</span>
                } @else {
                  <span>APAGAR TODOS OS PRODUTOS (FINAL)</span>
                }
              </button>
            }

            @if (operationComplete()) {
              <div class="bg-green-50 border border-green-200 rounded p-4">
                <p class="text-green-800 font-medium">
                  ✅ Operação concluída com sucesso!
                </p>
                <p class="text-green-700 text-sm mt-2">
                  Todos os produtos foram removidos do banco de dados.
                </p>
                <button
                  (click)="resetForm()"
                  class="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Reset
                </button>
              </div>
            }

            @if (hasError()) {
              <div class="bg-red-50 border border-red-200 rounded p-4">
                <p class="text-red-800 font-medium">
                  ❌ Erro na operação!
                </p>
                <p class="text-red-700 text-sm mt-2">
                  {{ errorMessage() }}
                </p>
              </div>
            }
          </div>
        </div>

        <div class="mt-6 text-center">
          <p class="text-gray-500 text-sm">
            Esta página é restrita e não deve ser compartilhada.
          </p>
        </div>
      </div>
    </div>
  `
})
export class AdminComponent {
  protected faTrashCan = faTrashCan;
  protected faExclamationTriangle = faExclamationTriangle;

  // Estados do formulário
  confirmStep1 = false;
  confirmationText = '';
  finalConfirmation = false;

  // Estados de controle
  step1Confirmed = signal(false);
  step2Confirmed = signal(false);
  step3Confirmed = signal(false);
  operationComplete = signal(false);
  isLoading = signal(false);
  hasError = signal(false);
  errorMessage = signal('');
  totalProducts = signal(0);

  constructor(private productService: ProductService) {
    this.loadProductCount();
  }

  async loadProductCount() {
    try {
      const products = await this.productService.getProductsDb()();
      this.totalProducts.set(products.length);
    } catch (error) {
      console.error('Erro ao carregar contagem de produtos:', error);
      this.totalProducts.set(0);
    }
  }

  confirmStep1Action() {
    if (this.confirmStep1) {
      this.step1Confirmed.set(true);
    }
  }

  confirmStep2Action() {
    if (this.confirmationText === 'APAGAR TODOS OS PRODUTOS') {
      this.step2Confirmed.set(true);
    }
  }

  async executeCleanup() {
    if (!this.finalConfirmation) return;

    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');

    try {
      // Chama o serviço para limpar os produtos
      await this.productService.deleteAllProductsDb();

      // Recarrega a lista de produtos
      await this.productService.loadProductsDb();

      this.operationComplete.set(true);
      this.totalProducts.set(0);
    } catch (error) {
      this.hasError.set(true);
      this.errorMessage.set('Erro ao limpar tabela de produtos: ' + (error as Error).message);
      console.error('Erro na limpeza:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  resetForm() {
    this.confirmStep1 = false;
    this.confirmationText = '';
    this.finalConfirmation = false;
    this.step1Confirmed.set(false);
    this.step2Confirmed.set(false);
    this.step3Confirmed.set(false);
    this.operationComplete.set(false);
    this.hasError.set(false);
    this.errorMessage.set('');
    this.loadProductCount();
  }
}
