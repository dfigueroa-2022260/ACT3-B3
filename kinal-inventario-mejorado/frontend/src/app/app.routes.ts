import { Routes } from '@angular/router';
import { CategoriasPageComponent } from './pages/categorias-page.component';
import { DashboardPageComponent } from './pages/dashboard-page.component';
import { ProductosPageComponent } from './pages/productos-page.component';
import { MovimientosPageComponent } from './pages/movimientos-page.component';
import { LoginPageComponent } from './pages/login-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPageComponent, title: 'Panel | Kinal Inventario' },
  { path: 'categorias', component: CategoriasPageComponent, title: 'Categorias | Kinal Inventario' },
  { path: 'productos', component: ProductosPageComponent, title: 'Productos | Kinal Inventario' },
  { path: 'movimientos', component: MovimientosPageComponent, title: 'Movimientos | Kinal Inventario' },
  { path: 'login', component: LoginPageComponent, title: 'Login | Kinal Inventario' },
  { path: '**', redirectTo: 'dashboard' },
];
