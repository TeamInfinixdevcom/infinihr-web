import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpleadoDTO, EmpleadoService } from '../../services/empleado.service';
import { EmpleadoFormComponent } from './empleado-form.component';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-empleado-profile',
  standalone: true,
  imports: [CommonModule, EmpleadoFormComponent],
  template: `
    <div *ngIf="loading">Cargando perfil...</div>
    <div *ngIf="!loading && empleado">
      <h2>Mi Perfil</h2>
      <div><strong>Cédula:</strong> {{empleado.id}}</div>
      <div><strong>Nombre:</strong> {{empleado.nombre}} {{empleado.apellidos}}</div>
      <div><strong>Username:</strong> {{empleado.username}}</div>
      <div><strong>Correo:</strong> {{empleado.correo}}</div>
      <button *ngIf="isAdmin" (click)="edit = !edit">{{edit ? 'Cancelar' : 'Editar'}}</button>
      <app-empleado-form *ngIf="edit" [empleado]="empleado" (saved)="onSaved($event)" [readOnly]="false"></app-empleado-form>
      <app-empleado-form *ngIf="!edit" [empleado]="empleado" [readOnly]="!isAdmin"></app-empleado-form>
    </div>
    <div *ngIf="!loading && !empleado">No se encontró perfil.</div>
  `
})
export class EmpleadoProfileComponent implements OnInit {
  empleado: EmpleadoDTO | null = null;
  loading = true;
  edit = false;
  isAdmin = false;

  constructor(private empleadoService: EmpleadoService, private auth: AuthService) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    // If admin, allow edit toggle; else keep read-only
    this.edit = false;
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.empleadoService.getMe().subscribe({
      next: v => { this.empleado = v; this.loading = false; },
      error: e => { console.error(e); this.loading = false; }
    });
  }

  onSaved(_: EmpleadoDTO) {
    this.edit = false;
    this.loadProfile();
  }
}
