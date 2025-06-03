import { Injectable, signal } from '@angular/core';
import { Product } from '@interfaces/product.interface';
import { MOCK_PRODUCTS } from '@app/mocks/products.mock';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products = signal<Product[]>(MOCK_PRODUCTS);

  constructor() {}

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
} 