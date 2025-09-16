import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  try {
    const isAdmin = auth.isAdmin();
    if (!isAdmin) {
      // Redirigir al dashboard o página de acceso denegado
      router.navigate(['/admin/dashboard']);
      return false;
    }
    return true;
  } catch (e) {
    router.navigate(['/login']);
    return false;
  }
};
