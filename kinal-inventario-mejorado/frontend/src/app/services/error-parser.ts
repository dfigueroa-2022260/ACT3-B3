export function parseApiError(error: unknown, fallbackMessage: string): string {
  if (typeof error !== 'object' || error === null) {
    return fallbackMessage;
  }

  const maybeError = error as {
    error?: { mensaje?: string };
    message?: string;
    status?: number;
  };

  if (maybeError.status === 0) {
    return 'No hay conexion con el backend. Verifica que la API este activa en el puerto 4021.';
  }

  if (maybeError.error?.mensaje) {
    return maybeError.error.mensaje;
  }

  if (maybeError.message) {
    return maybeError.message;
  }

  return fallbackMessage;
}
