import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  template: `
    <div class="dashboard-container">
      <h1>Panel de Administración</h1>
      <p class="subtitle">Gestiona usuarios, empleados y toda la información del sistema</p>
      
      <div class="dashboard-grid">
        
        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon users-icon">people</mat-icon>
            <mat-card-title>Usuarios</mat-card-title>
            <mat-card-subtitle>Gestionar usuarios del sistema</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Crear, editar y administrar los usuarios que pueden acceder al sistema.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="/admin/usuarios">
              <mat-icon>manage_accounts</mat-icon>
              Gestionar Usuarios
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon employees-icon">badge</mat-icon>
            <mat-card-title>Empleados</mat-card-title>
            <mat-card-subtitle>Información de empleados</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Administrar la información personal y laboral de todos los empleados.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="accent" disabled>
              <mat-icon>work</mat-icon>
              Próximamente
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon departments-icon">business</mat-icon>
            <mat-card-title>Departamentos</mat-card-title>
            <mat-card-subtitle>Estructura organizacional</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Configurar departamentos y la estructura organizacional de la empresa.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="accent" disabled>
              <mat-icon>account_tree</mat-icon>
              Próximamente
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon positions-icon">work_outline</mat-icon>
            <mat-card-title>Puestos</mat-card-title>
            <mat-card-subtitle>Cargos y posiciones</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Definir los diferentes puestos de trabajo y sus características.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="accent" disabled>
              <mat-icon>assignment_ind</mat-icon>
              Próximamente
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon vacations-icon">beach_access</mat-icon>
            <mat-card-title>Vacaciones</mat-card-title>
            <mat-card-subtitle>Gestión de vacaciones</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Administrar solicitudes y políticas de vacaciones de los empleados.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="warn" routerLink="/vacaciones">
              <mat-icon>calendar_today</mat-icon>
              Ver Vacaciones
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon reports-icon">assessment</mat-icon>
            <mat-card-title>Reportes</mat-card-title>
            <mat-card-subtitle>Análisis y reportes</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Generar reportes y análisis de la información del sistema.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="accent" disabled>
              <mat-icon>analytics</mat-icon>
              Próximamente
            </button>
          </mat-card-actions>
        </mat-card>

      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: #333;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #666;
      margin-bottom: 32px;
      font-size: 16px;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }

    .dashboard-card {
      height: 240px;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .dashboard-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }

    .card-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .users-icon {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .employees-icon {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .departments-icon {
      background-color: #e8f5e8;
      color: #388e3c;
    }

    .positions-icon {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .vacations-icon {
      background-color: #ffebee;
      color: #d32f2f;
    }

    .reports-icon {
      background-color: #e0f2f1;
      color: #00796b;
    }

    mat-card-content {
      flex-grow: 1;
      padding: 16px;
    }

    mat-card-actions {
      padding: 16px;
      margin-top: auto;
    }

    button {
      width: 100%;
    }

    button mat-icon {
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
      
      .dashboard-card {
        height: auto;
        min-height: 200px;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
