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
      if (isAuthenticated) {
        return true;
      }
      // No autenticado -> redirigir a login
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};