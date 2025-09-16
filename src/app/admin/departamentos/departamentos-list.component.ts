import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuariosService, Departamento } from '../../services/usuarios.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-departamentos-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="departamentos-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="header-icon">business</mat-icon>
          <mat-card-title>Gestión de Departamentos</mat-card-title>
          <mat-card-subtitle>Estructura organizacional de la empresa</mat-card-subtitle>
        </mat-card-header>
        <mat-card-actions>
          <button mat-raised-button color="primary">
            <mat-icon>add</mat-icon>
            Nuevo Departamento
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Cargando departamentos...</p>
      </div>

      <!-- Tabla de departamentos -->
      <mat-card *ngIf="!loading && departamentos?.length" class="table-card">
        <mat-card-content>
          <table mat-table [dataSource]="departamentos" class="departamentos-table">
            
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let d">
                <div class="id-cell">
                  <mat-icon class="dept-icon">business</mat-icon>
                  {{d.id}}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef>Nombre del Departamento</th>
              <td mat-cell *matCellDef="let d">
                <div class="nombre-cell">
                  <strong>{{d.nombre}}</strong>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="descripcion">
              <th mat-header-cell *matHeaderCellDef>Descripción</th>
              <td mat-cell *matCellDef="let d">
                <div class="descripcion-cell">
                  {{d.descripcion || 'Sin descripción'}}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let d">
                <div class="action-buttons">
                  <button mat-icon-button color="primary" matTooltip="Ver detalles">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" matTooltip="Eliminar">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="departamento-row"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <!-- Empty state -->
      <mat-card *ngIf="!loading && (!departamentos || departamentos.length === 0)" class="empty-state">
        <mat-card-content>
          <div class="empty-content">
            <mat-icon class="empty-icon">business_center</mat-icon>
            <h3>No hay departamentos registrados</h3>
            <p>Organiza tu empresa creando departamentos</p>
            <button mat-raised-button color="primary">
              <mat-icon>add</mat-icon>
              Crear Departamento
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .departamentos-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-card {
      margin-bottom: 24px;
    }

    .header-icon {
      background-color: #e8f5e8;
      color: #388e3c;
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

    .departamentos-table {
      width: 100%;
    }

    .id-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dept-icon {
      color: #388e3c;
      font-size: 20px;
    }

    .nombre-cell strong {
      font-weight: 500;
      color: #333;
    }

    .descripcion-cell {
      color: #666;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
    }

    .departamento-row:hover {
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

    @media (max-width: 768px) {
      .departamentos-container {
        padding: 16px;
      }
      
      .action-buttons {
        flex-direction: column;
        gap: 2px;
      }
    }
  `]
})
export class DepartamentosListComponent implements OnInit {
  departamentos: Departamento[] = [];
  loading = false;
  displayedColumns: string[] = ['id', 'nombre', 'descripcion'];

  constructor(
    private usuariosService: UsuariosService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Agregar columna de acciones solo para administradores
    if (this.authService.isAdmin()) {
      this.displayedColumns.push('acciones');
    }
    this.cargarDepartamentos();
  }

  cargarDepartamentos() {
    this.loading = true;
    this.usuariosService.getDepartamentos().subscribe({
      next: (data) => {
        this.departamentos = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando departamentos:', error);
        this.loading = false;
      }
    });
  }
}
