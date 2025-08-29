import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { TestComponent } from './components/test/test.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'test', component: TestComponent },
  { 
    path: 'vacaciones', 
    loadComponent: () => import('./services/caracteristicas/vacaciones/vacaciones-list.component').then(m => m.VacacionesListComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'empleado/vacaciones', 
    loadComponent: () => import('./services/caracteristicas/empleado-vacaciones/empleado-vacaciones.component').then(m => m.EmpleadoVacacionesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'vacaciones-empleado',
    loadComponent: () => import('./services/caracteristicas/empleado-vacaciones/empleado-vacaciones.component').then(m => m.EmpleadoVacacionesComponent),
    canActivate: [authGuard],
    data: { roles: ['empleado'] }
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];