// src/app/core/auth.interceptor.ts
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

/**
 * Interceptor funcional para añadir el token JWT a las solicitudes salientes.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si la URL es de login, no se añade el token.
  if (req.url.includes('/api/auth/login')) {
    return next(req);
  }

  // Si existe un token, se clona la solicitud y se añade el encabezado de autorización.
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`🔑 Interceptor: Token Bearer añadido a la URL: ${req.url}`);
    return next(clonedReq);
  }

  // Si no hay token, la solicitud continúa sin modificaciones.
  console.log(`⚠️ Interceptor: No hay token. Solicitud a ${req.url} sin autenticación.`);
  return next(req);
};
