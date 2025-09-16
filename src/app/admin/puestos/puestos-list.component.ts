import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuariosService, Puesto } from '../../services/usuarios.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-puestos-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="puestos-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="header-icon">work</mat-icon>
          <mat-card-title>Gestión de Puestos de Trabajo</mat-card-title>
          <mat-card-subtitle>Roles y posiciones dentro de la organización</mat-card-subtitle>
        </mat-card-header>
        <mat-card-actions>
          <button mat-raised-button color="primary">
            <mat-icon>add</mat-icon>
            Nuevo Puesto
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Cargando puestos de trabajo...</p>
      </div>

      <!-- Tabla de puestos -->
      <mat-card *ngIf="!loading && puestos?.length" class="table-card">
        <mat-card-content>
          <table mat-table [dataSource]="puestos" class="puestos-table">
            
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let p">
                <div class="id-cell">
                  <mat-icon class="puesto-icon">work</mat-icon>
                  {{p.id}}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef>Nombre del Puesto</th>
              <td mat-cell *matCellDef="let p">
                <div class="nombre-cell">
                  <strong>{{p.nombre}}</strong>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="departamento">
              <th mat-header-cell *matHeaderCellDef>Departamento</th>
              <td mat-cell *matCellDef="let p">
                <div class="departamento-cell">
                  {{p.departamentoId || 'Sin asignar'}}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="salario">
              <th mat-header-cell *matHeaderCellDef>Salario Base</th>
              <td mat-cell *matCellDef="let p">
                <div class="salario-cell">
                  <mat-chip-set *ngIf="p.salarioBase" class="salary-chip">
                    <mat-chip color="accent">
                      <mat-icon matChipAvatar>attach_money</mat-icon>
                      {{p.salarioBase | currency:'USD':'symbol':'1.0-0'}}
                    </mat-chip>
                  </mat-chip-set>
                  <span *ngIf="!p.salarioBase" class="no-salary">No definido</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let p">
                <div class="action-buttons">
                  <button mat-icon-button color="primary" matTooltip="Ver detalles">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Historial salarial">
                    <mat-icon>timeline</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" matTooltip="Eliminar">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="puesto-row"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <!-- Empty state -->
      <mat-card *ngIf="!loading && (!puestos || puestos.length === 0)" class="empty-state">
        <mat-card-content>
          <div class="empty-content">
            <mat-icon class="empty-icon">work_outline</mat-icon>
            <h3>No hay puestos de trabajo registrados</h3>
            <p>Define los roles y posiciones de tu organización</p>
            <button mat-raised-button color="primary">
              <mat-icon>add</mat-icon>
              Crear Puesto
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .puestos-container {
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

    .puestos-table {
      width: 100%;
    }

    .id-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .puesto-icon {
      color: #1976d2;
      font-size: 20px;
    }

    .nombre-cell strong {
      font-weight: 500;
      color: #333;
    }

    .departamento-cell {
      color: #666;
    }

    .salario-cell {
      display: flex;
      align-items: center;
    }

    .salary-chip {
      display: flex;
    }

    .no-salary {
      color: #999;
      font-style: italic;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
    }

    .puesto-row:hover {
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
      .puestos-container {
        padding: 16px;
      }
      
      .action-buttons {
        flex-direction: column;
        gap: 2px;
      }
    }
  `]
})
export class PuestosListComponent implements OnInit {
  puestos: Puesto[] = [];
  loading = false;
  displayedColumns: string[] = ['id', 'nombre', 'departamento', 'salario'];

  constructor(
    private usuariosService: UsuariosService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Agregar columna de acciones solo para administradores
    if (this.authService.isAdmin()) {
      this.displayedColumns.push('acciones');
    }
    this.cargarPuestos();
  }

  cargarPuestos() {
    this.loading = true;
    this.usuariosService.getPuestos().subscribe({
      next: (data) => {
        this.puestos = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando puestos:', error);
        this.loading = false;
      }
    });
  }
}
