import { Injectable, signal } from '@angular/core';
import { Product } from '@interfaces/product.interface';
import { MOCK_PRODUCTS } from '@app/mocks/products.mock';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products = signal<Product[]>(MOCK_PRODUCTS);
  private productsDb = signal<Product[]>([]);

  constructor(private http: HttpService) {
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

  // Métodos para produtos do banco SQLite
  getProductsDb() {
    return this.productsDb;
  }

  async loadProductsDb() {
    try {
      const products = await this.http.get<Product[]>('products');
      this.productsDb.set(products);
    } catch (error) {
      console.error('Erro ao carregar produtos do banco:', error);
      this.productsDb.set([]);
    }
  }

  getProductByIdDb(id: string) {
    return this.productsDb().find(product => product.id === id);
  }

  async addProductDb(product: Omit<Product, 'id'>) {
    try {
      const newProduct = await this.http.post<Product>('products', product);
      this.productsDb.update(products => [...products, newProduct]);
      return newProduct;
    } catch (error) {
      console.error('Erro ao adicionar produto no banco:', error);
      throw error;
    }
  }

  async updateProductDb(id: string, product: Partial<Product>) {
    try {
      const updatedProduct = await this.http.put<Product>(`products/${id}`, product);
      this.productsDb.update(products =>
        products.map(p => p.id === id ? updatedProduct : p)
      );
    } catch (error) {
      console.error('Erro ao atualizar produto no banco:', error);
      throw error;
    }
  }

  async deleteProductDb(id: string) {
    try {
      await this.http.delete(`products/${id}`);
      this.productsDb.update(products => products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erro ao deletar produto no banco:', error);
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
} 