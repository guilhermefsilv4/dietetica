import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBars,
  faXmark,
  faBell,
  faGaugeHigh as faDashboard,
  faBox,
  faBoxes,
  faShoppingCart,
  faUsers,
  faReceipt,
  faCashRegister,
  faFileImport
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './nav-menu.component.html'
})
export class NavMenuComponent {
  // Ícones
  protected faBars = faBars;
  protected faXmark = faXmark;
  protected faBell = faBell;
  protected faDashboard = faDashboard;
  protected faBox = faBox;
  protected faBoxes = faBoxes;
  protected faShoppingCart = faShoppingCart;
  protected faUsers = faUsers;
  protected faReceipt = faReceipt;
  protected faCashRegister = faCashRegister;
  protected faFileImport = faFileImport;

  // Estado do menu mobile
  protected mobileMenuOpen = signal(false);

  // Métodos
  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
