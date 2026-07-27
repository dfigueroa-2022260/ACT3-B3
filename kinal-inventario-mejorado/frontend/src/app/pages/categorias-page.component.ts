import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CategoriaService } from '../services/categoria.service';
import { Categoria } from '../models/categoria.model';
import { parseApiError } from '../services/error-parser';
import { reloadOnRevisit } from '../utils/reload-on-revisit';

@Component({
  selector: 'app-categorias-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="header-row">
      <div>
        <p class="kicker">Modulo categorias</p>
        <h2>Listado de categorias</h2>
        <p>Gestiona clasificaciones de productos de manera clara y ordenada.</p>
      </div>
      <button
        class="btn btn-outline"
        type="button"
        (click)="cargarCategorias()"
        [disabled]="loading()"
      >
        {{ loading() ? 'Cargando...' : 'Recargar' }}
      </button>
    </section>

    <!-- El banner de error no reemplaza el resto de la vista: asi el usuario
         puede reintentar sin perder el formulario ni la tabla que ya tenia. -->
    @if (error()) {
      <div class="error-box" role="alert" aria-live="assertive">
        <p>{{ error() }}</p>
        <button class="btn btn-outline btn-sm" type="button" (click)="cargarCategorias()">
          Reintentar
        </button>
      </div>
    }

    <div class="grid-wrap">
      <div class="card">
        <h3>{{ editandoId() ? 'Editar categoria' : 'Nueva categoria' }}</h3>
        @if (!authService.isAuthenticated()) {
          <p class="hint-box">Debes iniciar sesion para modificar categorias.</p>
        }

        <form [formGroup]="form" (ngSubmit)="guardar()">
          <label for="nombre">Nombre</label>
          <input id="nombre" type="text" formControlName="nombre" placeholder="Papeleria" />

          <label for="descripcion">Descripcion</label>
          <textarea
            id="descripcion"
            rows="3"
            formControlName="descripcion"
            placeholder="Insumos de oficina y aula"
          ></textarea>

          <div class="btn-row">
            <button
              class="btn btn-primary"
              type="submit"
              [disabled]="!authService.isAuthenticated() || form.invalid || saving()"
            >
              {{ saving() ? 'Guardando...' : editandoId() ? 'Actualizar' : 'Crear categoria' }}
            </button>
            <button
              class="btn btn-outline"
              type="button"
              (click)="cancelarEdicion()"
              [disabled]="saving()"
            >
              Limpiar
            </button>
          </div>
        </form>

        @if (mensaje()) {
          <p class="ok-msg" aria-live="polite">{{ mensaje() }}</p>
        }
      </div>

      <div class="card">
        <h3>Categorias disponibles ({{ categorias().length }})</h3>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripcion</th>
                <th>Productos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @if (loading() && categorias().length === 0) {
                @for (fila of [1, 2, 3]; track fila) {
                  <tr>
                    <td><span class="skeleton" style="display:block;height:1rem;width:70%"></span></td>
                    <td><span class="skeleton" style="display:block;height:1rem;width:90%"></span></td>
                    <td><span class="skeleton" style="display:block;height:1rem;width:2rem"></span></td>
                    <td><span class="skeleton" style="display:block;height:1rem;width:5rem"></span></td>
                  </tr>
                }
              }

              @for (categoria of categorias(); track categoria.id) {
                <tr>
                  <td>{{ categoria.nombre }}</td>
                  <td>{{ categoria.descripcion || 'Sin descripcion' }}</td>
                  <td><span class="badge badge-blue">{{ categoria._count?.productos ?? 0 }}</span></td>
                  <td class="actions">
                    <button
                      class="btn btn-sm"
                      style="background: var(--blue-600); color: #fff;"
                      type="button"
                      (click)="editar(categoria)"
                      [disabled]="!authService.isAuthenticated()"
                    >
                      Editar
                    </button>
                    <button
                      class="btn btn-sm btn-danger"
                      type="button"
                      (click)="eliminar(categoria.id)"
                      [disabled]="!authService.isAuthenticated()"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (!loading() && categorias().length === 0 && !error()) {
          <p class="empty-state">No hay categorias registradas todavia.</p>
        }
      </div>
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

      .grid-wrap {
        display: grid;
        gap: 1rem;
        grid-template-columns: minmax(260px, 350px) minmax(0, 1fr);
        margin-top: 1rem;
        align-items: start;
      }

      form {
        display: grid;
        gap: 0.6rem;
        margin-top: 0.6rem;
      }

      label {
        font-weight: 600;
        color: var(--blue-700);
      }

      input,
      textarea {
        border: 1px solid var(--border);
        border-radius: 0.65rem;
        padding: 0.68rem;
        font: inherit;
      }

      input:focus,
      textarea:focus {
        outline: none;
        border-color: var(--blue-500);
        box-shadow: 0 0 0 3px var(--blue-100);
      }

      .btn-row {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
      }

      .actions {
        white-space: nowrap;
        display: flex;
        gap: 0.4rem;
      }

      @media (max-width: 1024px) {
        .grid-wrap {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CategoriasPageComponent implements OnInit {
  categorias = signal<Categoria[]>([]);
  loading = signal(false);
  saving = signal(false);
  mensaje = signal<string | null>(null);
  error = signal<string | null>(null);
  editandoId = signal<number | null>(null);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    descripcion: ['', [Validators.maxLength(255)]],
  });

  constructor(
    private readonly fb: FormBuilder,
    public readonly authService: AuthService,
    private readonly categoriaService: CategoriaService,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    reloadOnRevisit(this.router, this.destroyRef, '/categorias', () => this.cargarCategorias());
  }

  cargarCategorias(): void {
    this.loading.set(true);
    this.error.set(null);

    this.categoriaService.listar().subscribe({
      next: (data) => {
        this.categorias.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(parseApiError(err, 'No se pudieron cargar las categorias.'));
        this.loading.set(false);
      },
    });
  }

  guardar(): void {
    if (this.form.invalid || !this.authService.isAuthenticated()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.mensaje.set(null);

    const payload = {
      nombre: this.form.value.nombre?.trim() || '',
      descripcion: this.form.value.descripcion?.trim() || undefined,
    };

    const request$ = this.editandoId()
      ? this.categoriaService.actualizar(this.editandoId() as number, payload)
      : this.categoriaService.crear(payload);

    request$.subscribe({
      next: () => {
        this.mensaje.set(this.editandoId() ? 'Categoria actualizada.' : 'Categoria creada.');
        this.saving.set(false);
        this.cancelarEdicion();
        this.cargarCategorias();
      },
      error: (err) => {
        this.error.set(parseApiError(err, 'No se pudo guardar la categoria.'));
        this.saving.set(false);
      },
    });
  }

  editar(categoria: Categoria): void {
    this.editandoId.set(categoria.id);
    this.form.patchValue({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
    });
  }

  eliminar(id: number): void {
    if (!this.authService.isAuthenticated() || !confirm('Deseas eliminar esta categoria?')) {
      return;
    }

    this.error.set(null);
    this.mensaje.set(null);

    this.categoriaService.eliminar(id).subscribe({
      next: () => {
        this.mensaje.set('Categoria eliminada correctamente.');
        this.cargarCategorias();
      },
      error: (err) => {
        this.error.set(parseApiError(err, 'No se pudo eliminar la categoria.'));
      },
    });
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.form.reset({ nombre: '', descripcion: '' });
  }
}
