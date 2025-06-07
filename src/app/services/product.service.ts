import { Injectable, signal } from '@angular/core';
import { Product } from '@interfaces/product.interface';
import { MOCK_PRODUCTS } from '@app/mocks/products.mock';
import { HttpService } from './http.service';
import { from, Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products = signal<Product[]>(MOCK_PRODUCTS);

  // Signal para produtos do banco - mantém compatibilidade total
  private productsDb = signal<Product[]>([]);

  // Observable com shareReplay para cache automático do carregamento
  private loadProducts$: Observable<Product[]> | null = null;

  constructor(private http: HttpService) {
    // Carrega dados automaticamente na primeira vez
    this.loadProductsDb();
  }

  // Métodos para produtos mock
  getProducts() {
    return this.products;
  }

  getProductById(id: string) {
    return this.products().find(product => product.id === id);
  }

  addProduct(product: Omit<Product, 'id'>) {
    const newProduct: Product = {
      ...product,
      id: Math.random().toString(36).substr(2, 9)
    };

    this.products.update(products => [...products, newProduct]);
    return newProduct;
  }

  updateProduct(id: string, product: Partial<Product>) {
    this.products.update(products =>
      products.map(p => p.id === id ? { ...p, ...product } : p)
    );
  }

  deleteProduct(id: string) {
    this.products.update(products => products.filter(p => p.id !== id));
  }

  getLowStockProducts(threshold?: number) {
    return this.products().filter(product =>
      product.stock <= (threshold || product.minStock)
    );
  }

  getProductsByCategory(category: string) {
    return this.products().filter(product => product.category === category);
  }

  searchProducts(query: string) {
    const searchTerm = query.toLowerCase();
    return this.products().filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm)
    );
  }

  // Métodos para produtos do banco SQLite com cache inteligente
  getProductsDb() {
    return this.productsDb;
  }

  async loadProductsDb() {
    // Se já temos um observable cached, use-o
    if (this.loadProducts$) {
      try {
        await this.loadProducts$.toPromise();
        return;
      } catch (error) {
        // Se deu erro, vamos tentar novamente
        this.loadProducts$ = null;
      }
    }

    // Cria um novo observable com shareReplay
    this.loadProducts$ = from(this.http.get<Product[]>('products')).pipe(
      tap(products => this.productsDb.set(products)),
      shareReplay(1)
    );

    try {
      await this.loadProducts$.toPromise();
    } catch (error) {
      console.error('Erro ao carregar produtos do banco:', error);
      this.productsDb.set([]);
      this.loadProducts$ = null; // Remove cache em caso de erro
    }
  }

  getProductByIdDb(id: string) {
    return this.productsDb().find(product => product.id === id);
  }

  async addProductDb(product: Omit<Product, 'id'>) {
    try {
      const newProduct = await this.http.post<Product>('products', product);
      this.productsDb.update(products => [...products, newProduct]);
      // Invalida o cache para próxima busca pegar dados frescos
      this.loadProducts$ = null;
      return newProduct;
    } catch (error) {
      console.error('Erro ao adicionar produto no banco:', error);
      throw error;
    }
  }

  async updateProductDb(id: string, product: Partial<Product>) {
    try {
      // Se for apenas atualização de estoque, enviar somente o campo stock
      if (Object.keys(product).length === 1 && 'stock' in product) {
        const updatedProduct = await this.http.put<Product>(`products/${id}`, { stock: product.stock });
        this.productsDb.update(products =>
          products.map(p => p.id === id ? { ...p, stock: updatedProduct.stock } : p)
        );
        return;
      }

      // Caso contrário, enviar todos os campos atualizados
      const updatedProduct = await this.http.put<Product>(`products/${id}`, product);
      this.productsDb.update(products =>
        products.map(p => p.id === id ? updatedProduct : p)
      );

      // Invalida o cache para próxima busca pegar dados frescos
      this.loadProducts$ = null;
    } catch (error) {
      console.error('Erro ao atualizar produto no banco:', error);
      throw error;
    }
  }

  async deleteProductDb(id: string) {
    try {
      await this.http.delete(`products/${id}`);
      this.productsDb.update(products => products.filter(p => p.id !== id));
      // Invalida o cache para próxima busca pegar dados frescos
      this.loadProducts$ = null;
    } catch (error) {
      console.error('Erro ao deletar produto no banco:', error);
      throw error;
    }
  }

  async deleteAllProductsDb() {
    try {
      await this.http.delete('products/all');
      this.productsDb.set([]);
      // Invalida o cache para próxima busca pegar dados frescos
      this.loadProducts$ = null;
    } catch (error) {
      console.error('Erro ao deletar todos os produtos do banco:', error);
      throw error;
    }
  }

  getLowStockProductsDb(threshold?: number) {
    return this.productsDb().filter(product =>
      product.stock <= (threshold || product.minStock)
    );
  }

  getProductsByCategoryDb(category: string) {
    return this.productsDb().filter(product => product.category === category);
  }

  searchProductsDb(query: string) {
    const searchTerm = query.toLowerCase();
    return this.productsDb().filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm)
    );
  }

  // Método para forçar recarregamento (invalida cache)
  async refreshProducts() {
    this.loadProducts$ = null; // Invalida cache
    await this.loadProductsDb();
  }
}
