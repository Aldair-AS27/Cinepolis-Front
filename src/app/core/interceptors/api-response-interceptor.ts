import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';
import { ApiResponse } from '../models/cinema-domain.models';

/**
 * Observa las respuestas del backend envueltas en `ApiResponse<T>`.
 * Deja pasar el body intacto (los servicios extraen `.data`) y deja
 * trazas útiles solo en desarrollo.
 */
export const apiResponseInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse && req.url.includes('/api')) {
        const body = event.body as ApiResponse<unknown> | null;
        if (body && body.success === false) {
          console.warn('[Cinépolis] Respuesta con success=false', req.url, body.message);
        }
      }
    }),
  );
