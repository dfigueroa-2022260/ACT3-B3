export type TipoMovimiento = 'ENTRADA' | 'SALIDA';

export interface Movimiento {
  id: number;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string | null;
  fecha: string;
  productoId: number;
  producto?: {
    id: number;
    nombre: string;
  };
}
