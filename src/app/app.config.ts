import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { apiUrlInterceptor } from './core/interceptors/api-url-interceptor';
import { mockBackendInterceptor } from './core/interceptors/mock-backend-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { apiResponseInterceptor } from './core/interceptors/api-response-interceptor';

import { authInterceptor } from './core/interceptors/auth.interceptor'; 

const interceptors: HttpInterceptorFn[] = [
  // 1º reescribe /api -> apiUrl real (Railway) salvo en modo mock.
  apiUrlInterceptor,
  errorInterceptor,
  apiResponseInterceptor,
];

if (environment.useMock) {
  interceptors.push(mockBackendInterceptor);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([...interceptors, authInterceptor])),
  ],
};
