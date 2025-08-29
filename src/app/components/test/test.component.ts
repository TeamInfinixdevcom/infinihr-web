import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { VacacionesService } from '../../services/vacaciones.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
      <mat-card>
        <mat-card-header>
          <mat-card-title>🔍 Diagnóstico InfiniHR</mat-card-title>
          <mat-card-subtitle>Verificación de conectividad y autenticación</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="section">
            <h3>🔐 Estado de Autenticación</h3>
            <div class="info-grid">
              <div><strong>Token:</strong> {{ tokenInfo }}</div>
              <div><strong>Usuario:</strong> {{ usuario || 'No autenticado' }}</div>
              <div><strong>Modo Bypass:</strong> {{ modoBypass ? '🔓 Activo' : '🔐 Inactivo' }}</div>
              <div><strong>API URL:</strong> {{ apiUrl }}</div>
            </div>
            
            <div class="buttons">
              <button mat-raised-button color="primary" (click)="hacerLogin()">
                🔑 Login Simulado
              </button>
              <button mat-button (click)="toggleBypass()">
                {{ modoBypass ? '🔐 Desactivar' : '🔓 Activar' }} Bypass
              </button>
              <button mat-button (click)="limpiarAuth()">
                🧹 Limpiar Auth
              </button>
            </div>
          </div>

          <div class="section">
            <h3>🌐 Pruebas de Conectividad</h3>
            <div class="buttons">
              <button mat-button (click)="probarVacaciones()" [disabled]="loading">
                📅 Probar Vacaciones
              </button>
              <button mat-button (click)="probarBackend()" [disabled]="loading">
                🏥 Probar Backend
              </button>
            </div>
          </div>
          
          <div *ngIf="loading" class="loading">
            <mat-icon>hourglass_empty</mat-icon>
            <span>Ejecutando prueba...</span>
          </div>
          
          <div *ngIf="resultado" class="result">
            <h4>{{ resultado.tipo === 'success' ? '✅ Éxito' : '❌ Error' }}</h4>
            <pre>{{ resultado.datos | json }}</pre>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .section {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    .info-grid {
      display: grid;
      gap: 8px;
      margin: 16px 0;
      font-family: monospace;
      background: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
    }
    .buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 16px;
    }
    .loading {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1976d2;
      font-weight: 500;
    }
    .result {
      margin-top: 20px;
      padding: 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #fafafa;
    }
    .result pre {
      margin: 8px 0 0 0;
      white-space: pre-wrap;
      word-break: break-word;
    }
  `]
})
export class TestComponent {
  tokenInfo = '';
  usuario = '';
  apiUrl = 'http://localhost:8082/api';
  loading = false;
  resultado: any = null;
  modoBypass = false;

  constructor(
    private http: HttpClient,
    private vacacionesService: VacacionesService,
    private authService: AuthService
  ) {
    this.actualizarInfo();
  }

  actualizarInfo() {
    const token = localStorage.getItem('token');
    this.tokenInfo = token ? `${token.substring(0, 20)}...` : 'No disponible';
    this.usuario = localStorage.getItem('username') || '';
    this.modoBypass = localStorage.getItem('auth_bypass') === 'true';
  }

  hacerLogin() {
    this.loading = true;
    this.resultado = null;
    
    this.authService.login('admin', 'admin').subscribe({
      next: (response: any) => {
        this.loading = false;
        this.actualizarInfo();
        this.resultado = { tipo: 'success', datos: 'Login exitoso' };
      },
      error: (err: any) => {
        this.loading = false;
        this.resultado = { tipo: 'error', datos: err.message };
      }
    });
  }

  limpiarAuth() {
    localStorage.clear();
    this.actualizarInfo();
    this.resultado = { tipo: 'success', datos: 'Autenticación limpiada' };
  }

  toggleBypass() {
    this.modoBypass = !this.modoBypass;
    if (this.modoBypass) {
      localStorage.setItem('auth_bypass', 'true');
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('roles');
    } else {
      localStorage.removeItem('auth_bypass');
    }
    this.actualizarInfo();
    this.resultado = { 
      tipo: 'success', 
      datos: `Modo bypass ${this.modoBypass ? 'activado' : 'desactivado'}` 
    };
  }

  probarVacaciones() {
    this.loading = true;
    this.resultado = null;
    
    this.vacacionesService.getVacaciones().subscribe({
      next: (data: any) => {
        this.loading = false;
        this.resultado = { tipo: 'success', datos: data };
      },
      error: (err: any) => {
        this.loading = false;
        this.resultado = { tipo: 'error', datos: { status: err.status, message: err.message } };
      }
    });
  }

  probarBackend() {
    this.loading = true;
    this.resultado = null;
    
    this.http.get(`${this.apiUrl}/empleados`).subscribe({
      next: (data: any) => {
        this.loading = false;
        this.resultado = { tipo: 'success', datos: data };
      },
      error: (err: any) => {
        this.loading = false;
        this.resultado = { tipo: 'error', datos: { status: err.status, message: err.message } };
      }
    });
  }
}