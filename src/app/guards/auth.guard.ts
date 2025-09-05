import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  // Debug inmediato
  const debugInfo = authService.debugAuth();
  console.log('🛡️ AuthGuard - Debug inicial:', {
    ...debugInfo,
    targetUrl: state.url
  });
  
  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      console.log('🛡️ AuthGuard - Usuario autenticado (Observable):', isAuthenticated);
      
      // Si tenemos token, permitir acceso independientemente del Observable
      if (debugInfo.hasToken) {
        console.log('✅ AuthGuard - Permitiendo acceso por token presente');
        return true;
      }
      
      console.log('❌ AuthGuard - Sin token, redirigiendo a login');
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};