import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { parseApiError } from '../services/error-parser';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="login-wrap card">
      <h2>Acceso administrativo</h2>
      <p>Inicia sesion para crear, editar o eliminar informacion.</p>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <label for="correo">Correo</label>
        <input id="correo" type="email" formControlName="correo" placeholder="admin@kinal.edu.gt" autocomplete="username" />

        <label for="password">Contrasena</label>
        <input
          id="password"
          type="password"
          formControlName="password"
          placeholder="Tu contrasena"
          autocomplete="current-password"
        />

        <button class="btn btn-primary" type="submit" [disabled]="loading() || form.invalid">
          {{ loading() ? 'Ingresando...' : 'Iniciar sesion' }}
        </button>
      </form>

      @if (mensaje()) {
        <p class="ok-msg" aria-live="polite">{{ mensaje() }}</p>
      }

      @if (error()) {
        <p class="error-msg" aria-live="assertive">{{ error() }}</p>
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: flex;
        justify-content: center;
        padding-top: 1rem;
      }

      .login-wrap {
        width: 100%;
        max-width: 420px;
      }

      h2 {
        margin: 0 0 0.2rem;
        background: var(--gradient-brand);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        display: inline-block;
      }

      p {
        color: var(--muted);
      }

      form {
        display: grid;
        gap: 0.65rem;
        margin-top: 1rem;
      }

      label {
        font-weight: 600;
        color: var(--blue-700);
      }

      input {
        border-radius: 0.65rem;
        border: 1px solid var(--border);
        padding: 0.75rem;
        font: inherit;
      }

      input:focus {
        outline: none;
        border-color: var(--blue-500);
        box-shadow: 0 0 0 3px var(--blue-100);
      }

      button {
        margin-top: 0.4rem;
        width: 100%;
      }
    `,
  ],
})
export class LoginPageComponent {
  form = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  loading = signal(false);
  error = signal<string | null>(null);
  mensaje = signal<string | null>(null);

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.mensaje.set(null);

    this.authService.login(this.form.getRawValue() as { correo: string; password: string }).subscribe({
      next: () => {
        this.loading.set(false);
        this.mensaje.set('Sesion iniciada correctamente.');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(parseApiError(err, 'No fue posible iniciar sesion.'));
      },
    });
  }
}
