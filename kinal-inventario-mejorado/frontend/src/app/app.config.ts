import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      // onSameUrlNavigation: 'reload' permite que al hacer clic de nuevo en un
      // link del menu (ej. "Categorias" estando ya en /categorias) el router
      // procese la navegacion en vez de ignorarla. Combinado con el hook
      // reloadOnRevisit() de cada pagina, esto evita que la vista se quede
      // "pegada" mostrando un error viejo cuando el usuario reintenta.
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
      withComponentInputBinding()
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
