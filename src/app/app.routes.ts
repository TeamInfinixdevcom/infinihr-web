import { Routes } from '@angular/router';
import { VacacionesListComponent } from './services/caracteristicas/vacaciones/vacaciones-list.component';

export const routes: Routes = [
  { path: '', component: VacacionesListComponent },
  { path: 'vacaciones', component: VacacionesListComponent },
  { path: '**', redirectTo: '' }
];
