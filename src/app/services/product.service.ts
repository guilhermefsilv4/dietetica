import { Injectable, computed, signal } from '@angular/core';
import { Product } from '@interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Signals
  private readonly products = signal<Product[]>([]);
  private readonly selectedCategory = signal<string>('');
  private readonly searchTerm = signal<string>('');

  // Computed values
  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const category = this.selectedCategory();
    
    return this.products().filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(term) ||
                          product.description.toLowerCase().includes(term);
      const matchesCategory = !category || product.category === category;
      
      return matchesSearch && matchesCategory;
    });
  });

  readonly lowStockProducts = computed(() => {
    return this.products().filter(product => product.stock < 10);
  });

  readonly totalProducts = computed(() => this.products().length);

  // Methods
  getProduct(id: string): Product | undefined {
    return this.products().find(product => product.id === id);
  }

  addProduct(product: Product) {
    this.products.update(products => [...products, product]);
  }

  updateProduct(updatedProduct: Product) {
    this.products.update(products =>
      products.map(product =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  }

  updateProductStock(productId: string, newStock: number) {
    const product = this.getProduct(productId);
    if (product) {
      this.updateProduct({ ...product, stock: newStock });
    }
  }

  deleteProduct(productId: string) {
    this.products.update(products =>
      products.filter(product => product.id !== productId)
    );
  }

  setSelectedCategory(category: string) {
    this.selectedCategory.set(category);
  }

  setSearchTerm(term: string) {
    this.searchTerm.set(term);
  }

  // Mock data for testing
  loadMockData() {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Semillas de Chía',
        description: 'Semillas orgánicas de chía ricas en omega-3',
        price: 250,
        stock: 50,
        category: 'Semillas',
        brand: 'NaturalSeeds',
        imageUrl: '/assets/images/chia-seeds.jpg'
      },
      {
        id: '2',
        name: 'Almendras',
        description: 'Almendras naturales sin sal',
        price: 450,
        stock: 8,
        category: 'Frutos Secos',
        brand: 'NutriNuts',
        imageUrl: '/assets/images/almonds.jpg'
      }
    ];

    this.products.set(mockProducts);
  }
} 