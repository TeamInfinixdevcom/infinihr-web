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
  
  // Verificar si el token está en el formato correcto
  if (token && !token.startsWith('Bearer ')) {
    console.log('🔄 Corrigiendo formato del token...');
    localStorage.setItem('token', `Bearer ${token}`);
  }
    
    let modifiedRequest = request;
    
    // No interceptar la solicitud de login
    if (request.url.includes('/api/auth/login')) {
      return next(request);
    }

    if (token) {
      // Modo normal: enviar token
      const headers = {
        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      modifiedRequest = request.clone({
        setHeaders: headers
      });
      
      console.log('✅ Token añadido a la solicitud:', headers.Authorization);
    } else if (!request.url.includes('/api/auth/')) {
      // Redireccionar al login si no hay token y no es una petición de autenticación
      console.log('⚠️ No hay token disponible, redirigiendo al login');
      router.navigate(['/login']);
      return next(request);
    } else {
      // Sin token: headers básicos (solo para peticiones de autenticación)
      modifiedRequest = request.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      console.log('⚠️ No hay token disponible, enviando solicitud de autenticación');
    }

    return next(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('🚨 Error en interceptor:', {
          url: request.url,
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          hasToken: !!token
        });

        // No interceptar errores en el login - dejar que los maneje el componente
        if (request.url.includes('/api/auth/login')) {
          return throwError(() => error);
        }

        // Para logout, NO redirigir nunca - el AuthService ya maneja la limpieza
        if (request.url.includes('/api/auth/logout')) {
          console.warn('⚠️ Error en logout - ignorando (sesión ya limpiada localmente)');
          return throwError(() => error);
        }

        // Para otros endpoints, manejar según el tipo de error
        if (error.status === 401) {
          console.error('🔐 Token expirado o inválido. Cerrando sesión...');
          if (!request.url.includes('/api/auth/')) {
            localStorage.clear();
            router.navigate(['/login']);
          }
        } else if (error.status === 403) {
          // Solo para endpoints que NO son de autenticación
          if (!request.url.includes('/api/auth/')) {
            console.error(`🚫 Acceso denegado a ${request.url}`);
            console.error(`🔑 Token presente: ${token ? 'Sí' : 'NO'}`);
            
            if (!token) {
              console.error('❌ Solicitud sin token. Redirigiendo al login...');
              localStorage.clear();
              router.navigate(['/login']);
            } else {
              console.warn('⚠️ 403 con token presente. NO redirigiendo automáticamente.');
              console.warn('   • Puede ser un problema temporal del servidor');
              console.warn('   • O permisos insuficientes para esta operación específica');
              console.warn('   • El usuario puede intentar recargar o hacer logout manual');
            }
          } else {
            console.warn('⚠️ Error 403 en endpoint de autenticación - ignorando para evitar loops');
          }
        } else if (error.status === 500) {
          console.error('⚠️ Error interno del servidor:', error.error);
        } else if (error.status === 0) {
          console.error('🌐 No hay conexión con el servidor o CORS error');
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