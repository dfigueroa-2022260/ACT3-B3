import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Vuelve a ejecutar `callback` cada vez que el usuario navega otra vez a la
 * misma ruta (por ejemplo, al hacer clic en "Categorias" del menu mientras
 * ya se encuentra en /categorias).
 *
 * Por defecto Angular reutiliza el componente activo y NO vuelve a llamar
 * ngOnInit cuando el destino es la misma URL, asi que si una carga anterior
 * fallo (error de red, backend caido, etc.) la pantalla se queda "congelada"
 * mostrando el error viejo aunque el usuario insista dando clic. Este helper
 * resuelve exactamente ese caso.
 *
 * Requiere que el router este configurado con
 * `withRouterConfig({ onSameUrlNavigation: 'reload' })` (ver app.config.ts).
 */
export function reloadOnRevisit(
  router: Router,
  destroyRef: DestroyRef,
  path: string,
  callback: () => void
): void {
  const normalizado = path.startsWith('/') ? path : `/${path}`;

  router.events
    .pipe(
      filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
      filter((evento) => evento.urlAfterRedirects.split('?')[0] === normalizado),
      takeUntilDestroyed(destroyRef)
    )
    .subscribe(() => callback());
}
