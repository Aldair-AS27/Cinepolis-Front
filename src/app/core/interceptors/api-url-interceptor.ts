import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Antepone `environment.apiUrl` a toda petición relativa a `/api`.
 * Se desactiva cuando `environment.useMock === true` para que el
 * `mockBackendInterceptor` pueda interceptar la ruta relativa.
 */
export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.useMock && req.url.startsWith('/api')) {
    return next(req.clone({ url: `${environment.apiUrl}${req.url}` }));
  }
  return next(req);
};
