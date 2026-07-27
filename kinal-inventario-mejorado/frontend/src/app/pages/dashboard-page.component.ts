import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CategoriaService } from '../services/categoria.service';
import { ProductoService } from '../services/producto.service';
import { MovimientoService } from '../services/movimiento.service';
import { parseApiError } from '../services/error-parser';
import { reloadOnRevisit } from '../utils/reload-on-revisit';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="hero">
      <div>
        <p class="eyebrow">Panel operativo</p>
        <h2>Gestion centralizada de inventario</h2>
        <p>
          Visualiza categorias, productos y movimientos desde un solo lugar para mantener
          el stock bajo control y reducir errores operativos.
        </p>
      </div>

      <div class="cards">
        <article>
          @if (cargando()) {
            <span class="skeleton" style="display:block;height:2rem;width:3.5rem"></span>
          } @else {
            <h3>{{ categorias() }}</h3>
          }
          <p>Categorias registradas</p>
          <a class="card-link" routerLink="/categorias">Ver categorias &rarr;</a>
        </article>
        <article>
          @if (cargando()) {
            <span class="skeleton" style="display:block;height:2rem;width:3.5rem"></span>
          } @else {
            <h3>{{ productos() }}</h3>
          }
          <p>Productos activos</p>
          <a class="card-link" routerLink="/productos">Ver productos &rarr;</a>
        </article>
        <article>
          @if (cargando()) {
            <span class="skeleton" style="display:block;height:2rem;width:3.5rem"></span>
          } @else {
            <h3>{{ movimientos() }}</h3>
          }
          <p>Movimientos historicos</p>
          <a class="card-link" routerLink="/movimientos">Ver movimientos &rarr;</a>
        </article>
      </div>
    </section>

    @if (error()) {
      <div class="error-box">
        <p>{{ error() }}</p>
        <button class="btn btn-outline btn-sm" type="button" (click)="cargarResumen()">Reintentar</button>
      </div>
    }
  `,
  styles: [
    `
      .hero {
        display: grid;
        gap: 1.2rem;
      }

      .eyebrow {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--red-600);
        font-weight: 700;
        font-size: 0.78rem;
      }

      h2 {
        margin: 0.4rem 0 0.75rem;
        font-size: clamp(1.35rem, 4vw, 2.2rem);
        line-height: 1.1;
      }

      .cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.8rem;
      }

      article {
        background: linear-gradient(140deg, #ffffff 0%, var(--blue-100) 100%);
        border: 1px solid var(--border);
        border-top: 3px solid var(--blue-500);
        border-radius: 0.9rem;
        padding: 1rem;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }

      article:nth-child(2) {
        border-top-color: var(--red-500);
      }

      article:nth-child(3) {
        border-top-color: var(--blue-700);
      }

      h3 {
        margin: 0;
        background: var(--gradient-brand);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        font-size: 2rem;
      }

      article p {
        margin: 0.2rem 0 0.4rem;
        color: var(--muted);
      }

      .card-link {
        color: var(--blue-700);
        font-weight: 700;
        font-size: 0.86rem;
        text-decoration: none;
      }

      .card-link:hover {
        color: var(--red-600);
      }

      .error-box {
        margin-top: 1.2rem;
      }
    `,
  ],
})
export class DashboardPageComponent implements OnInit {
  categorias = signal(0);
  productos = signal(0);
  movimientos = signal(0);
  cargando = signal(false);
  error = signal<string | null>(null);

  constructor(
    private readonly categoriaService: CategoriaService,
    private readonly productoService: ProductoService,
    private readonly movimientoService: MovimientoService,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.cargarResumen();
    reloadOnRevisit(this.router, this.destroyRef, '/dashboard', () => this.cargarResumen());
  }

  cargarResumen(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.categoriaService.listar().subscribe({
      next: (data) => {
        this.categorias.set(data.length);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(parseApiError(err, 'No se cargaron categorias.'));
        this.cargando.set(false);
      },
    });

    this.productoService.listar().subscribe({
      next: (data) => this.productos.set(data.length),
      error: (err) => this.error.set(parseApiError(err, 'No se cargaron productos.')),
    });

    this.movimientoService.listar().subscribe({
      next: (data) => this.movimientos.set(data.length),
      error: (err) => this.error.set(parseApiError(err, 'No se cargaron movimientos.')),
    });
  }
}
