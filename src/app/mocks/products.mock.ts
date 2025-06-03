import { Product } from '@interfaces/product.interface';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    barcode: '7890123456789',
    name: 'Quinoa Orgánica',
    description: 'Quinoa orgánica de alta calidad, rica en proteínas y libre de gluten',
    price: 1200,
    stock: 50,
    minStock: 20,
    category: 'Cereales',
    saleType: 'weight',
    weightUnit: 'kg',
    brand: 'NaturalLife',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: '2',
    barcode: '7890123456790',
    name: 'Almendras',
    description: 'Almendras naturales sin sal, fuente de proteínas y grasas saludables',
    price: 800,
    stock: 30,
    minStock: 15,
    category: 'Frutos Secos',
    saleType: 'weight',
    weightUnit: 'g',
    brand: 'NutriNuts',
    imageUrl: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: '3',
    barcode: '7890123456791',
    name: 'Miel Pura',
    description: 'Miel pura de abeja, sin aditivos ni conservantes',
    price: 650,
    stock: 25,
    minStock: 10,
    category: 'Endulzantes',
    saleType: 'unit',
    brand: 'ApiPura',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: '4',
    barcode: '7890123456792',
    name: 'Semillas de Chía',
    description: 'Semillas de chía ricas en omega-3 y fibra',
    price: 450,
    stock: 60,
    minStock: 25,
    category: 'Semillas',
    saleType: 'weight',
    weightUnit: 'g',
    brand: 'SeedLife',
    imageUrl: 'https://images.unsplash.com/photo-1514537099923-4c9871c7d956?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: '5',
    barcode: '7890123456793',
    name: 'Aceite de Coco',
    description: 'Aceite de coco orgánico prensado en frío',
    price: 950,
    stock: 15,
    minStock: 12,
    category: 'Aceites',
    saleType: 'unit',
    brand: 'CocoNature',
    imageUrl: 'https://images.unsplash.com/photo-1590477331415-c2f4bb2c3c86?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  }
]; 