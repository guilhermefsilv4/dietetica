import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '@interfaces/product.interface';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html'
})
export class ProductCardComponent {
  @Input({ required: true }) set productData(value: Product) {
    this.product.set(value);
  }

  @Output() onEdit = new EventEmitter<Product>();
  @Output() onDelete = new EventEmitter<string>();

  // Signals
  protected product = signal<Product>({} as Product);

  // Computed values
  protected stockStatus = computed(() => {
    const stock = this.product().stock;
    if (stock <= 0) return 'Sin stock';
    if (stock < 10) return 'Stock bajo';
    return 'En stock';
  });

  protected stockStatusClass = computed(() => {
    const stock = this.product().stock;
    return {
      'text-red-500': stock <= 0,
      'text-orange-500': stock > 0 && stock < 10,
      'text-green-500': stock >= 10
    };
  });
} 