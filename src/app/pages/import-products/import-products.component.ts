import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUpload,
  faFileExcel,
  faCheck,
  faExclamationTriangle,
  faTrash,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import { ProductService } from '@services/product.service';
import { Product } from '@interfaces/product.interface';

interface CsvProduct {
  codigo: string;
  nombre: string;
  rubro: string;
  proveedor: string;
  stockMinimo: number;
  costo: number;
  precio: number;
  precioMayor: number;
  markup: number;
}

interface ProcessedProduct extends Product {
  isValid: boolean;
  errors: string[];
  originalRow: number;
}

@Component({
  selector: 'app-import-products',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './import-products.component.html'
})
export class ImportProductsComponent {
  // Icons
  protected faUpload = faUpload;
  protected faFileExcel = faFileExcel;
  protected faCheck = faCheck;
  protected faExclamationTriangle = faExclamationTriangle;
  protected faTrash = faTrash;
  protected faSave = faSave;

  // Signals
  csvFile = signal<File | null>(null);
  csvData = signal<CsvProduct[]>([]);
  processedProducts = signal<ProcessedProduct[]>([]);
  isProcessing = signal(false);
  importProgress = signal(0);
  importResults = signal<{ success: number; errors: number; skipped: number; total: number } | null>(null);

  // Computed
  validProducts = computed(() =>
    this.processedProducts().filter(p => p.isValid)
  );

  invalidProducts = computed(() =>
    this.processedProducts().filter(p => !p.isValid)
  );

  constructor(private productService: ProductService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        this.csvFile.set(file);
        this.readCsvFile(file);
      } else {
        alert('Por favor, selecciona un archivo CSV válido.');
      }
    }
  }

  private readCsvFile(file: File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      await this.parseCsv(text);
    };
    reader.readAsText(file);
  }

  private async parseCsv(csvText: string) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());

    // Verificar se os headers estão corretos
    const expectedHeaders = ['CODIGO', 'NOMBRE', 'RUBRO', 'PROVEEDOR', 'STOCK MINIMO', 'COSTO', 'PRECIO', 'PRECIO X MAYOR', 'MARKUP %'];

    if (!this.validateHeaders(headers, expectedHeaders)) {
      alert('El formato del CSV no es correcto. Asegúrate de que tenga los headers correctos.');
      return;
    }

    const csvProducts: CsvProduct[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());

      if (values.length >= 9) {
        csvProducts.push({
          codigo: values[0],
          nombre: values[1],
          rubro: values[2],
          proveedor: values[3],
          stockMinimo: parseInt(values[4]) || 0,
          costo: parseFloat(values[5]) || 0,
          precio: parseFloat(values[6]) || 0,
          precioMayor: parseFloat(values[7]) || 0,
          markup: parseFloat(values[8]) || 0
        });
      }
    }

    this.csvData.set(csvProducts);
    await this.processProducts();
  }

  private validateHeaders(headers: string[], expected: string[]): boolean {
    return expected.every(header => headers.includes(header));
  }

    private async processProducts() {
    const processed: ProcessedProduct[] = [];

    // Carregar produtos existentes do banco para verificar duplicatas
    await this.productService.loadProductsDb();
    const existingProducts = this.productService.getProductsDb()();

    this.csvData().forEach((csvProduct, index) => {
      const errors: string[] = [];

                  // Se não tem nome, usar um nome padrão
      const name = csvProduct.nombre || 'Producto sin nombre';

      // Se não tem preço ou é 0, usar 0 (pode ser ajustado depois)
      const price = csvProduct.precio > 0 ? csvProduct.precio : 0;

      // Criar descrição com os dados disponíveis
      const descParts = [csvProduct.proveedor, csvProduct.rubro].filter(Boolean);
      const description = descParts.length > 0 ? descParts.join(' - ') : 'Sin descripción';

      let barcode: string;
      let existsInDb = false;
      let isDuplicateInCsv = false;

      if (csvProduct.codigo && csvProduct.codigo.trim() !== '') {
        // Produto tem código de barras
        barcode = csvProduct.codigo.trim();

        // Verificar se já existe no banco
        existsInDb = existingProducts.some(p => p.barcode === barcode);

        // Verificar se é duplicata dentro do próprio CSV
        isDuplicateInCsv = processed.some(p => p.barcode === barcode);
      } else {
        // Produto não tem código de barras - verificar se já existe um similar com código TEMP
        const brand = csvProduct.proveedor || 'Sin proveedor';
        const category = csvProduct.rubro || 'Sin categoría';

        // Procurar produto similar que já tenha código TEMP
        const existingTempProduct = existingProducts.find(p =>
          p.barcode.startsWith('TEMP_') //&&
          // p.name === name &&
          // p.brand === brand &&
          // p.category === category
        );

        if (existingTempProduct) {
          // Já existe produto similar com código TEMP
          barcode = existingTempProduct.barcode;
          existsInDb = true;
        } else {
          // Gerar novo código temporário
          barcode = `TEMP_${Date.now()}_${index}`;

          // Verificar duplicata no CSV atual
          // isDuplicateInCsv = processed.some(p =>
          //   p.name === name &&
          //   p.brand === brand &&
          //   p.category === category
          // );
        }
      }

      if (existsInDb) {
        errors.push('Ya existe en la base de datos');
      }

      // if (isDuplicateInCsv) {
      //   errors.push('Duplicado en el archivo CSV');
      // }

      const product: ProcessedProduct = {
        id: '', // Será gerado pelo banco
        barcode: barcode,
        name: name,
        description: description,
        category: csvProduct.rubro || 'Sin categoría',
        price: price,
        stock: 0, // Stock inicial 0, pode ser ajustado depois
        minStock: csvProduct.stockMinimo || 0,
        saleType: 'unit', // Default para unit, pode ser ajustado
        brand: csvProduct.proveedor || 'Sin proveedor',
        imageUrl: 'assets/sinimagen.jpg', // Imagem padrão conforme solicitado
        hasVariants: false,
        isValid: errors.length === 0, // Válido apenas se não há erros
        errors: errors,
        originalRow: index + 2 // +2 porque começamos da linha 1 (header) e index começa em 0
      };

      processed.push(product);
    });

    this.processedProducts.set(processed);
  }

  removeProduct(index: number) {
    const products = this.processedProducts();
    products.splice(index, 1);
    this.processedProducts.set([...products]);
  }

        async importProducts() {
    const validProducts = this.validProducts();
    if (validProducts.length === 0) {
      alert('No hay productos válidos para importar.');
      return;
    }

    this.isProcessing.set(true);
    this.importProgress.set(0);

    let success = 0;
    let errors = 0;

    for (let i = 0; i < validProducts.length; i++) {
      try {
        const product = validProducts[i];

        // Remove propriedades específicas do processamento
        const { isValid, errors: validationErrors, originalRow, ...productData } = product;



        await this.productService.addProductDb(productData);
        success++;
      } catch (error) {
        console.error('Erro ao importar produto:', error);
        errors++;
      }

      this.importProgress.set(Math.round(((i + 1) / validProducts.length) * 100));
    }

    const totalProcessed = this.processedProducts().length;
    const skipped = totalProcessed - validProducts.length;

    this.importResults.set({
      success,
      errors,
      skipped,
      total: totalProcessed
    });

    this.isProcessing.set(false);
  }

  clearData() {
    this.csvFile.set(null);
    this.csvData.set([]);
    this.processedProducts.set([]);
    this.importResults.set(null);
    this.importProgress.set(0);
  }
}
