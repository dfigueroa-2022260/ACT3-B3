import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Producto } from '../models/producto.model';
import { ProductoService } from '../services/producto.service';
import { parseApiError } from '../services/error-parser';
import { reloadOnRevisit } from '../utils/reload-on-revisit';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="header-row">
      <div>
        <p class="kicker">Modulo productos</p>
        <h2>Productos</h2>
        <p>Consulta de inventario actual.</p>
      </div>
      <button class="btn btn-outline" type="button" (click)="cargarProductos()" [disabled]="loading()">
        {{ loading() ? 'Cargando...' : 'Recargar' }}
      </button>
    </section>

    @if (error()) {
      <div class="error-box" role="alert" aria-live="assertive">
        <p>{{ error() }}</p>
        <button class="btn btn-outline btn-sm" type="button" (click)="cargarProductos()">Reintentar</button>
      </div>
    }

    <div class="card table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoria</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Stock minimo</th>
            </tr>
          </thead>
          <tbody>
            @if (loading() && productos().length === 0) {
              @for (fila of [1, 2, 3, 4]; track fila) {
                <tr>
                  <td><span class="skeleton" style="display:block;height:1rem;width:80%"></span></td>
                  <td><span class="skeleton" style="display:block;height:1rem;width:60%"></span></td>
                  <td><span class="skeleton" style="display:block;height:1rem;width:3rem"></span></td>
                  <td><span class="skeleton" style="display:block;height:1rem;width:2rem"></span></td>
                  <td><span class="skeleton" style="display:block;height:1rem;width:2rem"></span></td>
                </tr>
              }
            }

            @for (producto of productos(); track producto.id) {
              <tr>
                <td>{{ producto.nombre }}</td>
                <td>{{ producto.categoria?.nombre || 'Sin categoria' }}</td>
                <td>Q {{ producto.precio }}</td>
                <td>
                  <span
                    class="badge"
                    [class.badge-red]="producto.stock <= producto.stockMinimo"
                    [class.badge-blue]="producto.stock > producto.stockMinimo"
                  >
                    {{ producto.stock }}
                  </span>
                </td>
                <td>{{ producto.stockMinimo }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (!loading() && productos().length === 0 && !error()) {
        <p class="empty-state">No hay productos registrados todavia.</p>
      }
    </div>
  `,
  styles: [
    `
      .header-row {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: flex-start;
        flex-wrap: wrap;
      }

      .kicker {
        margin: 0;
        color: var(--red-600);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.78rem;
        font-weight: 700;
      }

      h2 {
        margin: 0.4rem 0;
        background: var(--gradient-brand);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        display: inline-block;
      }

      .error-box {
        margin-top: 1rem;
      }

      .table-card {
        margin-top: 1rem;
      }
    `,
  ],
})
export class ProductosPageComponent implements OnInit {
  productos = signal<Producto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private readonly productoService: ProductoService,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    reloadOnRevisit(this.router, this.destroyRef, '/productos', () => this.cargarProductos());
  }

  cargarProductos(): void {
    this.loading.set(true);
    this.error.set(null);
    this.productoService.listar().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(parseApiError(err, 'No se pudo obtener productos.'));
        this.loading.set(false);
      },
    });
  }
}
