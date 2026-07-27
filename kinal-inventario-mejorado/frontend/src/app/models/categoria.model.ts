export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  creadoEn: string;
  actualizadoEn: string;
  _count?: {
    productos: number;
  };
}

export interface CategoriaPayload {
  nombre: string;
  descripcion?: string;
}
