import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      console.log('AuthGuard - Usuario autenticado:', isAuthenticated);
      
      if (isAuthenticated) {
        return true;
      }
      
      // Si hay token pero no estamos autenticados, puede ser que la sesión expiró
      if (authService.getToken()) {
        console.log('Token presente pero sesión inválida, redirigiendo a login');
      }
      
      console.log('Usuario no autenticado, redirigiendo a login');
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};