import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  template: `
    <mat-sidenav-container class="admin-container">
      
      <mat-sidenav #sidenav mode="side" opened class="admin-sidenav">
        <mat-toolbar color="primary">
          <span>Administración</span>
        </mat-toolbar>
        
        <mat-nav-list>
          <a mat-list-item routerLink="/admin/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          
          <a mat-list-item routerLink="/admin/usuarios" routerLinkActive="active">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Usuarios</span>
          </a>
          
          <a mat-list-item routerLink="/admin/empleados" routerLinkActive="active">
            <mat-icon matListItemIcon>badge</mat-icon>
            <span matListItemTitle>Empleados</span>
          </a>
          
          <a mat-list-item routerLink="/admin/departamentos" routerLinkActive="active">
            <mat-icon matListItemIcon>business</mat-icon>
            <span matListItemTitle>Departamentos</span>
          </a>
          
          <a mat-list-item routerLink="/admin/puestos" routerLinkActive="active">
            <mat-icon matListItemIcon>work</mat-icon>
            <span matListItemTitle>Puestos</span>
          </a>
          
          <a mat-list-item routerLink="/admin/vacaciones" routerLinkActive="active">
            <mat-icon matListItemIcon>beach_access</mat-icon>
            <span matListItemTitle>Vacaciones</span>
          </a>
          
          <mat-divider></mat-divider>
          
          <a mat-list-item routerLink="/empleado-vacaciones">
            <mat-icon matListItemIcon>arrow_back</mat-icon>
            <span matListItemTitle>Volver a Empleado</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="admin-content">
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span>Panel de Administración</span>
          <span class="spacer"></span>
          <button mat-icon-button>
            <mat-icon>notifications</mat-icon>
          </button>
          <button mat-icon-button>
            <mat-icon>account_circle</mat-icon>
          </button>
        </mat-toolbar>
        
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
      
    </mat-sidenav-container>
  `,
  styles: [`
    .admin-container {
      height: 100vh;
    }

    .admin-sidenav {
      width: 250px;
    }

    .admin-content {
      margin-left: 250px;
    }

    .content-wrapper {
      padding: 20px;
      height: calc(100vh - 64px);
      overflow-y: auto;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .active {
      background-color: rgba(0, 0, 0, 0.04);
    }

    mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    @media (max-width: 768px) {
      .admin-content {
        margin-left: 0;
      }
      
      .admin-sidenav {
        width: 100%;
      }
    }
  `]
})
export class AdminComponent {
}
