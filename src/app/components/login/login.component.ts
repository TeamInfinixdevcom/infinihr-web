import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';

interface AuthResponse {
  token?: string;
  username?: string;
  rol?: string;
  id?: number;
  message?: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>InfiniHR - Iniciar Sesión</mat-card-title>
          <mat-card-subtitle>Sistema de Gestión de Recursos Humanos</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Usuario</mat-label>
              <input matInput type="text" [(ngModel)]="username" name="username" required>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput type="password" [(ngModel)]="password" name="password" required>
            </mat-form-field>
            
            <button mat-raised-button color="primary" type="submit" [disabled]="loading" class="full-width">
              <mat-spinner *ngIf="loading" diameter="20" class="login-spinner"></mat-spinner>
              <span *ngIf="!loading">Iniciar Sesión</span>
            </button>

            <div class="backend-info">
              <p>Estado del servidor: <span [class]="backendStatus">{{ backendStatusText }}</span></p>
              <button mat-button type="button" (click)="checkBackend()" color="accent">
                🔍 Verificar conexión
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
    }
    .login-card {
      max-width: 400px;
      width: 100%;
      padding: 20px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .login-spinner {
      display: inline-block;
      margin-right: 8px;
    }
    .backend-info {
      margin-top: 20px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
      text-align: center;
    }
    .unknown { color: #666; }
    .checking { color: #2196f3; }
    .online { color: #4caf50; }
    .offline { color: #f44336; }
    .auth-required { color: #ff9800; }
    .error { color: #f44336; }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  backendStatus = 'unknown';
  backendStatusText = 'No verificado';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.checkBackend();
  }

  checkBackend(): void {
    console.log('🔍 Verificando estado del backend...');
    this.backendStatus = 'checking';
    this.backendStatusText = 'Verificando...';

    this.http.get('/api/empleados').subscribe({
      next: () => {
        this.backendStatus = 'online';
        this.backendStatusText = '✅ Online';
        this.snackBar.open('Servidor conectado', 'OK', { duration: 3000 });
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 403) {
          // Error 403 significa que el servidor está online pero requiere autenticación
          this.backendStatus = 'online';
          this.backendStatusText = '✅ Online (Requiere autenticación)';
          console.log('✅ Backend online - respuesta 403 esperada');
        } else if (error.status === 0) {
          this.backendStatus = 'offline';
          this.backendStatusText = '❌ Offline';
        } else {
          this.backendStatus = 'error';
          this.backendStatusText = `❌ Error ${error.status}`;
        }
      }
    });
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.snackBar.open('Por favor, ingresa usuario y contraseña', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.loading = true;
    
    // Autenticar con el backend
    this.authService.login(this.username, this.password).subscribe({
      next: (response: AuthResponse) => {
        console.log('✅ Login exitoso:', response);
        this.loading = false;
        this.snackBar.open('Inicio de sesión exitoso', 'OK', {
          duration: 3000
        });

        console.log('👤 Info de usuario guardada:', {
          username: this.username,
          rol: response.rol,
          id: response.id
        });

        // Redirigir según el rol con manejo de errores
        try {
          const userRole = response.rol?.toLowerCase() || '';
          console.log('🔍 Rol recibido:', response.rol, 'Normalizado:', userRole);
          
          if (userRole.includes('admin') || userRole.includes('role_admin')) {
            console.log('➡️ Redirigiendo a /admin (administrador)');
            this.router.navigate(['/admin']).catch(err => {
              console.error('❌ Error al navegar a /admin:', err);
              this.snackBar.open('Error de navegación', 'Cerrar', { duration: 3000 });
            });
          } else if (userRole.includes('empleado') || userRole.includes('role_empleado')) {
            console.log('➡️ Redirigiendo a /empleado-vacaciones (empleado)');
            this.router.navigate(['/empleado-vacaciones']).catch(err => {
              console.error('❌ Error al navegar a /empleado-vacaciones:', err);
              this.snackBar.open('Error de navegación', 'Cerrar', { duration: 3000 });
            });
          } else {
            console.warn('⚠️ Rol no reconocido:', response.rol);
            this.snackBar.open('Rol no reconocido: ' + response.rol, 'Cerrar', { 
              duration: 4000 
            });
          }
        } catch (navigationError) {
          console.error('❌ Error en navegación:', navigationError);
          this.snackBar.open('Error de navegación', 'Cerrar', { duration: 3000 });
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Error en login:', error);
        this.loading = false;
        
        let errorMessage = 'Error al iniciar sesión';
        
        try {
          if (error.status === 401) {
            errorMessage = 'Usuario o contraseña incorrectos';
          } else if (error.status === 403) {
            errorMessage = 'Acceso denegado';
          } else if (error.status === 0) {
            errorMessage = 'No se puede conectar con el servidor';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
        } catch (parseError) {
          console.error('❌ Error procesando error de login:', parseError);
          errorMessage = 'Error desconocido al iniciar sesión';
        }
        
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000
        });
      }
    });
  }
}