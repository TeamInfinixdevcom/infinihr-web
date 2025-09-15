// src/app/core/auth.interceptor.ts
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interceptor funcional para añadir el token JWT a las solicitudes salientes.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  console.log(`🔍 [Interceptor] Interceptando: ${req.method} ${req.url}`);
  
  // Obtener token directamente desde localStorage para consistencia
  const rawToken = localStorage.getItem('token');
  console.log(`🔑 [Interceptor] Token desde localStorage:`, rawToken ? `${rawToken.substring(0, 20)}...` : 'NULL');

  // Si la URL es de login, no se añade el token.
  if (req.url.includes('/api/auth/login')) {
    console.log('🔓 [Interceptor] Petición de login detectada, no se añade token');
    return next(req);
  }

  // Si existe un token, se clona la solicitud y se añade el encabezado de autorización.
  if (rawToken) {
    const bearerToken = rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`;
    console.log('🎫 [Interceptor] Token con Bearer:', `${bearerToken.substring(0, 30)}...`);
    
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: bearerToken,
      },
    });
    
    console.log('📤 [Interceptor] Authorization header final:', clonedReq.headers.get('Authorization')?.substring(0, 30) + '...');
    console.log('🚀 [Interceptor] Enviando petición autenticada a:', req.url);
    
    return next(clonedReq);
  }

  // Si no hay token, la solicitud continúa sin modificaciones.
  console.warn(`⚠️ [Interceptor] No hay token. Enviando petición SIN autenticación a: ${req.url}`);
  return next(req);
};
