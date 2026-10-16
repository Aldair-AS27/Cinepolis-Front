import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Normaliza cualquier error de red/HTTP a un `HttpErrorResponse`
 * y lo propaga para que los servicios/componentes puedan manejarlo.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) => {
      const httpError =
        error instanceof HttpErrorResponse
          ? error
          : new HttpErrorResponse({ status: 0, statusText: 'Error desconocido', url: req.url, error });

      if (httpError.status === 0) {
        console.error('[Cinépolis] Sin conexión con el backend', httpError.message);
      } else if (httpError.status >= 500) {
        console.error(`[Cinépolis] Error del servidor (${httpError.status})`, httpError.message);
      }

      return throwError(() => httpError);
    }),
  );
