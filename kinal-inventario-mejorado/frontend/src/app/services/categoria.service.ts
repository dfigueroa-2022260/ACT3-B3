import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Categoria, CategoriaPayload } from '../models/categoria.model';
import { parseApiError } from './error-parser';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Categoria[]> {
    return this.http
      .get<ApiResponse<Categoria[]>>(`${environment.apiUrl}/categorias`)
      .pipe(
        map((response) => {
          if (!response.ok || !Array.isArray(response.data)) {
            throw new Error('La respuesta del servidor para categorias no tiene el formato esperado.');
          }
          return response.data;
        }),
        catchError((error) =>
          throwError(() =>
            new Error(parseApiError(error, 'No fue posible obtener las categorias.'))
          )
        )
      );
  }

  crear(payload: CategoriaPayload): Observable<Categoria> {
    return this.http
      .post<ApiResponse<Categoria>>(`${environment.apiUrl}/categorias`, payload)
      .pipe(
        map((response) => {
          if (!response.ok || !response.data) {
            throw new Error(response.mensaje || 'No se pudo crear la categoria.');
          }
          return response.data;
        }),
        catchError((error) =>
          throwError(() => new Error(parseApiError(error, 'Error al crear categoria.')))
        )
      );
  }

  actualizar(id: number, payload: CategoriaPayload): Observable<Categoria> {
    return this.http
      .put<ApiResponse<Categoria>>(`${environment.apiUrl}/categorias/${id}`, payload)
      .pipe(
        map((response) => {
          if (!response.ok || !response.data) {
            throw new Error(response.mensaje || 'No se pudo actualizar la categoria.');
          }
          return response.data;
        }),
        catchError((error) =>
          throwError(() =>
            new Error(parseApiError(error, 'Error al actualizar categoria.'))
          )
        )
      );
  }

  eliminar(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<never>>(`${environment.apiUrl}/categorias/${id}`)
      .pipe(
        map((response) => {
          if (!response.ok) {
            throw new Error(response.mensaje || 'No se pudo eliminar la categoria.');
          }
        }),
        catchError((error) =>
          throwError(() => new Error(parseApiError(error, 'Error al eliminar categoria.')))
        )
      );
  }
}
