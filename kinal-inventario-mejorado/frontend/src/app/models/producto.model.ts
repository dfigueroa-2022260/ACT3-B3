import { Categoria } from './categoria.model';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: string;
  stock: number;
  stockMinimo: number;
  categoriaId: number;
  categoria?: Categoria;
}
