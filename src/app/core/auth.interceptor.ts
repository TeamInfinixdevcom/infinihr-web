// src/app/core/auth.interceptor.ts
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

/**
 * Interceptor funcional para añadir el token JWT a las solicitudes salientes.
 * También maneja automáticamente los errores 403 (Forbidden) redirigiendo al login.
 * Versión con debugging mejorado.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  console.log(`🔍 [Interceptor v2] Interceptando: ${req.method} ${req.url}`);
  
  // ✅ Inyectar servicios al nivel superior del interceptor (contexto válido)
  const router = inject(Router);
  const authService = inject(AuthService);
  
  // Obtener token directamente desde localStorage para consistencia
  const rawToken = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const rol = localStorage.getItem('rol');
  
  console.log(`🔑 [Interceptor] Datos de auth:`, {
    hasToken: !!rawToken,
    tokenPreview: rawToken ? `${rawToken.substring(0, 30)}...` : 'NO TOKEN',
    username: username || 'NO USERNAME',
    rol: rol || 'NO ROL',
    url: req.url
  });

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
    
    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores 403 de manera más inteligente
        if (error.status === 403) {
          console.warn('🚫 [Interceptor] Error 403 detectado en:', req.url);
          console.warn('🔍 [Interceptor] Detalles del error 403:', {
            url: req.url,
            method: req.method,
            status: error.status,
            statusText: error.statusText,
            errorBody: error.error,
            username: localStorage.getItem('username'),
            rol: localStorage.getItem('rol'),
            hasToken: !!localStorage.getItem('token')
          });
          
          // Verificar si realmente es un problema de token expirado
          const token = localStorage.getItem('token');
          let shouldLogout = false;
          
          if (!token) {
            console.warn('🚫 [Interceptor] No hay token - logout justificado');
            shouldLogout = true;
          } else {
            // Verificar si el token parece expirado
            try {
              const parts = token.split('.');
              if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                const currentTime = Math.floor(Date.now() / 1000);
                if (payload.exp && payload.exp < currentTime) {
                  console.warn('🚫 [Interceptor] Token realmente expirado - logout justificado');
                  shouldLogout = true;
                } else {
                  console.warn('⚠️ [Interceptor] Token válido pero 403 - posible problema de permisos');
                }
              } else {
                console.warn('🚫 [Interceptor] Token malformado - logout justificado');
                shouldLogout = true;
              }
            } catch (e) {
              console.warn('� [Interceptor] Error decodificando token - logout justificado');
              shouldLogout = true;
            }
          }
          
          if (shouldLogout) {
            console.warn('🧹 [Interceptor] Limpiando datos de autenticación...');
            authService.handleExpiredSession('Token expirado detectado por interceptor');
            router.navigate(['/login']);
            return throwError(() => new Error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.'));
          } else {
            console.warn('⚠️ [Interceptor] Error 403 pero token válido - no desloguear');
            // Retornar el error original sin desloguear
            return throwError(() => error);
          }
        }
        
        // Para otros errores, continuar con el flujo normal
        return throwError(() => error);
      })
    );
  }

  // Si no hay token, la solicitud continúa sin modificaciones.
  console.warn(`⚠️ [Interceptor] No hay token. Enviando petición SIN autenticación a: ${req.url}`);
  return next(req);
};
