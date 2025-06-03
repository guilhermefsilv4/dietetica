import { ProductVariant } from '@interfaces/product-variant.interface';

// Variações para o Mix de Frutos Secos
export const MIX_FRUTOS_SECOS_VARIANTS: ProductVariant[] = [
  {
    id: 'v1',
    productId: 'mix1',
    name: '1kg',
    price: 2500,
    stock: 20,
    barcode: '7890123456794',
    weight: 1000
  },
  {
    id: 'v2',
    productId: 'mix1',
    name: '500g',
    price: 1300,
    stock: 30,
    barcode: '7890123456795',
    weight: 500
  },
  {
    id: 'v3',
    productId: 'mix1',
    name: '250g',
    price: 700,
    stock: 40,
    barcode: '7890123456796',
    weight: 250
  },
  {
    id: 'v4',
    productId: 'mix1',
    name: '100g',
    price: 300,
    stock: 50,
    barcode: '7890123456797',
    weight: 100
  }
]; 