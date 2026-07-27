import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Producto } from '../models/producto.model';
import { parseApiError } from './error-parser';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Producto[]> {
    return this.http
      .get<ApiResponse<Producto[]>>(`${environment.apiUrl}/productos`)
      .pipe(
        map((response) => {
          if (!response.ok || !Array.isArray(response.data)) {
            throw new Error('Respuesta invalida al obtener productos.');
          }
          return response.data;
        }),
        catchError((error) =>
          throwError(() => new Error(parseApiError(error, 'No se pudo cargar productos.')))
        )
      );
  }
}
