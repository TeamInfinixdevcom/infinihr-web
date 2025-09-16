import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { EmpleadoDTO, EmpleadoService } from '../../services/empleado.service';
import { AuthService } from '../../services/auth/auth.service';
import { EmpleadoFormComponent } from './empleado-form.component';

@Component({
  selector: 'app-empleados-list',
  standalone: true,
  imports: [
    CommonModule, 
    EmpleadoFormComponent,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  template: `
    <div class="empleados-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="header-icon">badge</mat-icon>
          <mat-card-title>Gestión de Empleados</mat-card-title>
          <mat-card-subtitle>Administra la información de todos los empleados</mat-card-subtitle>
        </mat-card-header>
        <mat-card-actions *ngIf="isAdmin()">
          <button mat-raised-button color="primary">
            <mat-icon>add</mat-icon>
            Nuevo Empleado
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Loading -->
      <div *ngIf="!empleados" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Cargando empleados...</p>
      </div>

      <!-- Tabla de empleados -->
      <mat-card *ngIf="empleados && empleados.length" class="table-card">
        <mat-card-content>
          <table mat-table [dataSource]="empleados" class="empleados-table">
            
            <ng-container matColumnDef="cedula">
              <th mat-header-cell *matHeaderCellDef>Cédula</th>
              <td mat-cell *matCellDef="let e">{{e.id}}</td>
            </ng-container>

            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef>Nombre Completo</th>
              <td mat-cell *matCellDef="let e">
                <div class="nombre-cell">
                  <strong>{{e.nombre}} {{e.apellidos}}</strong>
                  <small>{{e.username}}</small>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="correo">
              <th mat-header-cell *matHeaderCellDef>Correo</th>
              <td mat-cell *matCellDef="let e">{{e.correo}}</td>
            </ng-container>

            <ng-container matColumnDef="rol">
              <th mat-header-cell *matHeaderCellDef>Rol</th>
              <td mat-cell *matCellDef="let e">
                <mat-chip [color]="e.rol === 'ADMIN' ? 'primary' : 'accent'">
                  {{e.rol}}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="activo">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let e">
                <mat-chip [color]="e.activo ? 'primary' : 'warn'">
                  <mat-icon>{{e.activo ? 'check_circle' : 'cancel'}}</mat-icon>
                  {{e.activo ? 'Activo' : 'Inactivo'}}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="acciones" *ngIf="isAdmin()">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let e">
                <div class="action-buttons">
                  <button mat-icon-button color="primary" (click)="view(e)" matTooltip="Ver detalles">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" (click)="edit(e)" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button [color]="e.activo ? 'warn' : 'primary'" 
                          (click)="toggleActivo(e)" 
                          [matTooltip]="e.activo ? 'Desactivar' : 'Activar'">
                    <mat-icon>{{e.activo ? 'person_off' : 'person'}}</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="remove(e)" matTooltip="Eliminar">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="empleado-row"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <!-- Empty state -->
      <mat-card *ngIf="empleados && empleados.length === 0" class="empty-state">
        <mat-card-content>
          <div class="empty-content">
            <mat-icon class="empty-icon">person_outline</mat-icon>
            <h3>No hay empleados registrados</h3>
            <p>Comienza agregando tu primer empleado al sistema</p>
            <button mat-raised-button color="primary" *ngIf="isAdmin()">
              <mat-icon>add</mat-icon>
              Agregar Empleado
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Detalle del empleado -->
      <mat-card *ngIf="selectedEmpleado" class="detail-card">
        <mat-card-header>
          <mat-icon mat-card-avatar color="primary">person</mat-icon>
          <mat-card-title>Detalle del Empleado</mat-card-title>
          <mat-card-subtitle>{{selectedEmpleado.nombre}} {{selectedEmpleado.apellidos}}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <app-empleado-form [empleado]="selectedEmpleado" [readOnly]="true"></app-empleado-form>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button (click)="selectedEmpleado = null">
            <mat-icon>close</mat-icon>
            Cerrar
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .empleados-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-card {
      margin-bottom: 24px;
    }

    .header-icon {
      background-color: #e3f2fd;
      color: #1976d2;
      font-size: 48px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .table-card {
      margin-bottom: 24px;
    }

    .empleados-table {
      width: 100%;
    }

    .nombre-cell strong {
      display: block;
      font-weight: 500;
    }

    .nombre-cell small {
      color: #666;
      font-size: 0.875rem;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
    }

    .empleado-row:hover {
      background-color: #f5f5f5;
    }

    .empty-state {
      margin-bottom: 24px;
    }

    .empty-content {
      text-align: center;
      padding: 40px 20px;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-content h3 {
      margin: 16px 0 8px 0;
      color: #666;
    }

    .empty-content p {
      color: #999;
      margin-bottom: 24px;
    }

    .detail-card {
      margin-top: 24px;
    }

    mat-chip {
      font-size: 0.875rem;
    }

    mat-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    @media (max-width: 768px) {
      .empleados-container {
        padding: 16px;
      }
      
      .action-buttons {
        flex-direction: column;
        gap: 2px;
      }
    }
  `]
})
export class EmpleadosListComponent implements OnInit {
  empleados: EmpleadoDTO[] | null = null;
  selectedEmpleado: EmpleadoDTO | null = null;
  displayedColumns: string[] = ['cedula', 'nombre', 'correo', 'rol', 'activo'];

  constructor(private empleadoService: EmpleadoService, private auth: AuthService) {}

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.displayedColumns.push('acciones');
    }
    this.load();
  }

  load() {
    this.empleadoService.getAll().subscribe({
      next: data => this.empleados = data,
      error: err => {
        console.error('Error cargando empleados', err);
        this.empleados = [];
      }
    });
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  edit(e: EmpleadoDTO) {
    // placeholder: navigate to edit form later
    console.log('edit', e);
  }

  view(e: EmpleadoDTO) {
    this.selectedEmpleado = e;
  }

  toggleActivo(e: EmpleadoDTO) {
    if (!e.id) return;
    // call usuarios service to toggle activo on usuarios endpoint if needed
    // For now, call empleado update with inverted activo
    this.empleadoService.update(e.id, { activo: !e.activo }).subscribe({
      next: updated => this.load(),
      error: err => console.error('toggleActivo error', err)
    });
  }

  remove(e: EmpleadoDTO) {
    if (!e.id) {
      return;
    }
    if (!confirm('Eliminar empleado ' + e.id + '?')) {
      return;
    }
    this.empleadoService.delete(e.id).subscribe({
      next: () => this.load(),
      error: err => console.error('delete error', err)
    });
  }
}
