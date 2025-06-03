import { Routes } from '@angular/router';
import { DashboardComponent } from '@pages/dashboard/dashboard.component';
import { StockComponent } from '@pages/stock/stock.component';
import { ProductsComponent } from '@pages/products/products.component';
import { SalesComponent } from '@pages/sales/sales.component';
import { CustomersComponent } from '@pages/customers/customers.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'stock', component: StockComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'sales', component: SalesComponent },
  { path: 'customers', component: CustomersComponent },
  {
    path: 'tickets',
    loadComponent: () => import('./pages/tickets/tickets.component').then(m => m.TicketsComponent)
  },
  {
    path: 'cash-closing',
    loadComponent: () => import('./components/cash-closing/cash-closing.component').then(m => m.CashClosingComponent),
    title: 'Cierre de Caja'
  }
];
