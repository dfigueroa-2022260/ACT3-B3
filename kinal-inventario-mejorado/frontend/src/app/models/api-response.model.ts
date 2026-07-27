export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  mensaje?: string;
  token?: string;
}
