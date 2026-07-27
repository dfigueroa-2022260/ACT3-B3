import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Movimiento } from '../models/movimiento.model';
import { parseApiError } from './error-parser';

@Injectable({ providedIn: 'root' })
export class MovimientoService {
  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Movimiento[]> {
    return this.http
      .get<ApiResponse<Movimiento[]>>(`${environment.apiUrl}/movimientos`)
      .pipe(
        map((response) => {
          if (!response.ok || !Array.isArray(response.data)) {
            throw new Error('Respuesta invalida al obtener movimientos.');
          }
          return response.data;
        }),
        catchError((error) =>
          throwError(() =>
            new Error(parseApiError(error, 'No se pudo cargar movimientos.'))
          )
        )
      );
  }
}
