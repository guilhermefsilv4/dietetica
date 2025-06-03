export interface ProductVariant {
  id: string;
  productId: string;  // ID do produto principal
  name: string;       // Nome da variação (ex: "500g", "1kg")
  price: number;      // Preço específico desta variação
  stock: number;      // Estoque específico desta variação
  barcode?: string;   // Código de barras opcional para esta variação
  weight?: number;    // Peso em gramas (se aplicável)
} 