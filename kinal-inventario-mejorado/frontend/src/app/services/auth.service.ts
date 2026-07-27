import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

interface LoginPayload {
  correo: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'kinal_inventario_token';
  private readonly authenticated = signal<boolean>(this.hasToken());

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginPayload): Observable<void> {
    return this.http
      .post<ApiResponse<never>>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(
        map((response) => {
          if (!response.ok || !response.token) {
            throw new Error(response.mensaje || 'No se pudo iniciar sesion.');
          }
          localStorage.setItem(this.tokenKey, response.token);
          this.authenticated.set(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.authenticated.set(false);
  }

  token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return this.authenticated();
  }

  authState() {
    return this.authenticated.asReadonly();
  }

  private hasToken(): boolean {
    return Boolean(localStorage.getItem(this.tokenKey));
  }
}
