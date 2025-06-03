import { Injectable } from '@angular/core';
import { Sale, SaleItem } from '@interfaces/sale.interface';
import { PaymentMethod, Payment } from '@interfaces/payment.interface';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private mockSales: Sale[] = [
    {
      id: '1',
      date: new Date(2024, 2, 20, 10, 30),
      subtotal: 150.50,
      total: 150.50,
      status: 'completed',
      payments: [
        { 
          id: '1a',
          date: new Date(2024, 2, 20, 10, 30),
          method: 'cash',
          amount: 100.50
        },
        {
          id: '1b',
          date: new Date(2024, 2, 20, 10, 30),
          method: 'credit',
          amount: 50.00
        }
      ],
      items: [
        {
          id: '1',
          productId: 'prod1',
          name: 'Produto 1',
          quantity: 2,
          unitPrice: 75.25,
          price: 75.25,
          subtotal: 150.50
        }
      ]
    },
    {
      id: '2',
      date: new Date(2024, 2, 20, 14, 15),
      subtotal: 85.00,
      total: 85.00,
      status: 'completed',
      payments: [
        {
          id: '2a',
          date: new Date(2024, 2, 20, 14, 15),
          method: 'debit',
          amount: 85.00
        }
      ],
      items: [
        {
          id: '2',
          productId: 'prod2',
          name: 'Produto 2',
          quantity: 1,
          unitPrice: 85.00,
          price: 85.00,
          subtotal: 85.00
        }
      ]
    },
    {
      id: '3',
      date: new Date(2024, 2, 20, 16, 45),
      subtotal: 200.00,
      total: 200.00,
      status: 'completed',
      payments: [
        {
          id: '3a',
          date: new Date(2024, 2, 20, 16, 45),
          method: 'qr',
          amount: 200.00
        }
      ],
      items: [
        {
          id: '3',
          productId: 'prod3',
          name: 'Produto 3',
          quantity: 2,
          unitPrice: 100.00,
          price: 100.00,
          subtotal: 200.00
        }
      ]
    }
  ];

  getMockSales(): Sale[] {
    return this.mockSales;
  }

  addMockSale(sale: Sale): void {
    this.mockSales.push(sale);
  }

  // Função auxiliar para gerar dados de teste
  generateMockSale(): Sale {
    const methods: PaymentMethod[] = ['cash', 'credit', 'debit', 'transfer', 'qr'];
    const randomMethod = methods[Math.floor(Math.random() * methods.length)];
    const quantity = Math.floor(Math.random() * 5) + 1;
    const unitPrice = Math.floor(Math.random() * 100) + 10;
    const subtotal = quantity * unitPrice;
    const now = new Date();
    const productId = Math.random().toString(36).substr(2, 9);

    const item: SaleItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId,
      name: `Produto Teste ${Math.floor(Math.random() * 100)}`,
      quantity,
      unitPrice,
      price: unitPrice,
      subtotal
    };

    return {
      id: Math.random().toString(36).substr(2, 9),
      date: now,
      subtotal,
      total: subtotal,
      status: 'completed',
      payments: [
        {
          id: Math.random().toString(36).substr(2, 9),
          date: now,
          method: randomMethod,
          amount: subtotal
        }
      ],
      items: [item]
    };
  }
} 