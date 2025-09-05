import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
    const token = localStorage.getItem('token');
    
    console.log(`🔍 Interceptando solicitud a ${request.url}`);
    console.log(`🔑 Token disponible: ${token ? 'Sí (' + token.substring(0, 20) + '...)' : 'No'}`);
    console.log(`📋 Método: ${request.method}`);
    
    let modifiedRequest = request;
    
    // No interceptar la solicitud de login
    if (request.url.includes('/api/auth/login')) {
      return next(request);
    }

    if (token) {
      // Modo normal: enviar token
      modifiedRequest = request.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log('✅ Token añadido a la solicitud');
    } else {
      // Sin token: headers básicos
      modifiedRequest = request.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log('⚠️ No hay token disponible, enviando solicitud sin autenticación');
    }

    return next(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('🚨 Error en interceptor:', {
          url: request.url,
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });

        // No interceptar errores en el login
        if (request.url.includes('/api/auth/login')) {
          return throwError(() => error);
        }

        if (error.status === 401) {
          console.error('🔐 Token expirado o inválido. Cerrando sesión...');
          localStorage.clear();
          router.navigate(['/login']);
        } else if (error.status === 403) {
          if (!request.url.includes('/api/auth/validate')) {
            console.error(`🚫 Acceso denegado a ${request.url}`);
            console.error(`🔑 Token presente: ${token ? 'Sí' : 'NO'}`);
            if (!token) {
              console.error('❌ ERROR CRÍTICO: Solicitud sin token. Redirigiendo al login...');
              localStorage.clear();
              router.navigate(['/login']);
            } else {
              console.warn('⚠️ Se recibió 403 pero existe token — puede que el servidor esté rechazando por roles/permiso');
            }
          }
        } else if (error.status === 500) {
          console.error('⚠️ Error interno del servidor:', error.error);
        } else if (error.status === 0) {
          console.error('🌐 No hay conexión con el servidor');
        } else {
          console.error(`❌ Error ${error.status} en ${request.url}:`, error.error);
        }
        return throwError(() => error);
      }),
      finalize(() => {
        console.log(`✅ Solicitud a ${request.url} completada`);
      })
    );
};