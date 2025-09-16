import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { TestComponent } from './components/test/test.component';
import { DebugAuthComponent } from './components/debug-auth/debug-auth.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'test', component: TestComponent },
  { path: 'debug-auth', component: DebugAuthComponent }, // Ruta temporal para debugging
  { 
    path: 'vacaciones', 
    loadComponent: () => import('./services/caracteristicas/vacaciones/vacaciones-list.component').then(m => m.VacacionesListComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'empleado-vacaciones', 
    loadComponent: () => import('./services/caracteristicas/empleado-vacaciones/empleado-vacaciones.component').then(m => m.EmpleadoVacacionesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'vacaciones-empleado',
    loadComponent: () => import('./services/caracteristicas/empleado-vacaciones/empleado-vacaciones.component').then(m => m.EmpleadoVacacionesComponent),
    canActivate: [authGuard],
    data: { roles: ['empleado'] }
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
  canActivate: [authGuard, adminGuard],
  data: { roles: ['ADMIN'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./admin/usuarios/usuarios-list.component').then(m => m.UsuariosListComponent)
      },
      {
        path: 'empleados',
        loadComponent: () => import('./admin/empleados/empleados-list.component').then(m => m.EmpleadosListComponent)
      },
      {
        path: 'departamentos',
        loadComponent: () => import('./admin/departamentos/departamentos-list.component').then(m => m.DepartamentosListComponent)
      },
      {
        path: 'puestos',
        loadComponent: () => import('./admin/puestos/puestos-list.component').then(m => m.PuestosListComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'empleados/me',
    loadComponent: () => import('./admin/empleados/empleado-profile.component').then(m => m.EmpleadoProfileComponent),
    canActivate: [authGuard]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];