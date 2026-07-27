import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Movimiento } from '../models/movimiento.model';
import { MovimientoService } from '../services/movimiento.service';
import { parseApiError } from '../services/error-parser';
import { reloadOnRevisit } from '../utils/reload-on-revisit';

@Component({
  selector: 'app-movimientos-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="header-row">
      <div>
        <p class="kicker">Modulo movimientos</p>
        <h2>Movimientos</h2>
        <p>Historial de entradas y salidas de inventario.</p>
      </div>
      <button class="btn btn-outline" type="button" (click)="cargarMovimientos()" [disabled]="loading()">
        {{ loading() ? 'Cargando...' : 'Recargar' }}
      </button>
    </section>

    @if (error()) {
      <div class="error-box" role="alert" aria-live="assertive">
        <p>{{ error() }}</p>
        <button class="btn btn-outline btn-sm" type="button" (click)="cargarMovimientos()">Reintentar</button>
      </div>
    }

    <div class="card table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            @if (loading() && movimientos().length === 0) {
              @for (fila of [1, 2, 3, 4]; track fila) {
                <tr>
                  <td><span class="skeleton" style="display:block;height:1rem;width:70%"></span></td>
                  <td><span class="skeleton" style="display:block;height:1rem;width:3rem"></span></td>
                  <td><span class="skeleton" style="display:block;height:1rem;width:80%"></span></td>
                  <td><span class="skeleton" style="display:block;height:1rem;width:2rem"></span></td>
                  <td><span class="skeleton" style="display:block;height:1rem;width:60%"></span></td>
                </tr>
              }
            }

            @for (movimiento of movimientos(); track movimiento.id) {
              <tr>
                <td>{{ movimiento.fecha | date : 'short' }}</td>
                <td>
                  <span
                    class="badge"
                    [class.badge-red]="movimiento.tipo === 'SALIDA'"
                    [class.badge-blue]="movimiento.tipo === 'ENTRADA'"
                  >
                    {{ movimiento.tipo }}
                  </span>
                </td>
                <td>{{ movimiento.producto?.nombre || 'N/A' }}</td>
                <td>{{ movimiento.cantidad }}</td>
                <td>{{ movimiento.motivo || 'Sin detalle' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (!loading() && movimientos().length === 0 && !error()) {
        <p class="empty-state">No hay movimientos registrados todavia.</p>
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
export class MovimientosPageComponent implements OnInit {
  movimientos = signal<Movimiento[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private readonly movimientoService: MovimientoService,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.cargarMovimientos();
    reloadOnRevisit(this.router, this.destroyRef, '/movimientos', () => this.cargarMovimientos());
  }

  cargarMovimientos(): void {
    this.loading.set(true);
    this.error.set(null);
    this.movimientoService.listar().subscribe({
      next: (data) => {
        this.movimientos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(parseApiError(err, 'No se pudo obtener movimientos.'));
        this.loading.set(false);
      },
    });
  }
}
