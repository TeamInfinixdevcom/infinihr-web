import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { take, map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Comportamiento seguro: permitir sólo si el observable emite true
  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        // No autenticado -> redirigir a login
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }

      // ✅ NUEVO: Verificar roles si la ruta los requiere
      const requiredRoles = route.data?.['roles'] as string[];
      if (requiredRoles && requiredRoles.length > 0) {
        const userRole = authService.getCurrentRole();
        console.log('🔒 [AuthGuard] Ruta requiere roles:', requiredRoles, 'Usuario tiene:', userRole);
        
        const hasPermission = requiredRoles.some(role => 
          userRole?.toUpperCase().includes(role.toUpperCase())
        );

        if (!hasPermission) {
          console.log('❌ [AuthGuard] Acceso denegado - permisos insuficientes');
          // Redirigir según el rol del usuario
          if (userRole?.toUpperCase().includes('ADMIN')) {
            router.navigate(['/admin']);
          } else {
            router.navigate(['/empleado-vacaciones']);
          }
          return false;
        }
      }

      return true;
    })
  );
};