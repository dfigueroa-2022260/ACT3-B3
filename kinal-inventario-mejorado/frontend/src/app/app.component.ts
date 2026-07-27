import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: 'dashboard' | 'categorias' | 'productos' | 'movimientos';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly navItems: NavItem[] = [
    { label: 'Panel', route: '/dashboard', icon: 'dashboard' },
    { label: 'Categorias', route: '/categorias', icon: 'categorias' },
    { label: 'Productos', route: '/productos', icon: 'productos' },
    { label: 'Movimientos', route: '/movimientos', icon: 'movimientos' },
  ];

  menuAbierto = signal(false);
  auth = computed(() => this.authService.isAuthenticated());

  constructor(private readonly authService: AuthService) {}

  alternarMenu(): void {
    this.menuAbierto.update((valor) => !valor);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  logout(): void {
    this.cerrarMenu();
    this.authService.logout();
  }
}
