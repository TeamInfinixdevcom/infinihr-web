import { Component, OnInit } from '@angular/core';
import { VacacionesService } from '../../vacaciones.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router } from '@angular/router';

// Importar el componente de diálogo para vacaciones
import { VacacionesDialogComponent } from '../vacaciones/vacaciones-dialog.component';
import { Vacacion } from '../../vacaciones.service';

@Component({
  selector: 'app-empleado-vacaciones',
  templateUrl: './empleado-vacaciones.component.html',
  styleUrls: ['./empleado-vacaciones.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatOptionModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class EmpleadoVacacionesComponent implements OnInit {
  vacaciones: Vacacion[] = [];
  loading = false;
  error = '';
  displayedColumns: string[] = ['fechaInicio', 'fechaFin', 'dias', 'estado', 'motivo', 'acciones'];
  userInfo: any;

  constructor(
    private vacacionesService: VacacionesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public authService: AuthService,
    public router: Router
  ) {
    this.userInfo = this.authService.getUserInfo();
  }

  ngOnInit(): void {
    const token = this.authService.getToken();
    
    if (!token) {
      this.snackBar.open('No hay sesión activa. Redirigiendo al login...', 'Cerrar', { duration: 3000 });
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }
    
    this.waitForEmpleadoIdAndLoad();
  }

  private debugLocalStorage(): void {
    // Método removido para limpiar el código
  }

  private waitForEmpleadoIdAndLoad(): void {
    let attempts = 0;
    const maxAttempts = 50; // 10 segundos máximo (50 * 200ms)
    
    const check = () => {
      attempts++;
      const empleadoCedula = this.authService.getEmpleadoCedula();
      const empleadoId = this.authService.getEmpleadoId();
      const token = this.authService.getToken();
      
      if (!token) {
        this.error = 'No hay token de autenticación. Por favor, vuelva a iniciar sesión.';
        return;
      }
      
      if (empleadoCedula || empleadoId) {
        this.cargarVacaciones();
      } else if (attempts < maxAttempts) {
        setTimeout(check, 200);
      } else {
        this.error = 'No se pudo obtener la información del empleado. Intente cerrar sesión y volver a ingresar.';
      }
    };
    check();
  }

  cargarVacaciones(): void {
    this.loading = true;
    this.error = '';

    const token = this.authService.getToken();
    if (!token) {
      this.error = 'Sesión expirada. Por favor, vuelva a iniciar sesión.';
      this.loading = false;
      return;
    }

    this.vacacionesService.getVacacionesEmpleado().subscribe({
      next: (data: Vacacion[]) => {
        // Filtrar solo vacaciones válidas
        this.vacaciones = data.filter(v => 
          v.estado === 'Pendiente' || v.estado === 'Aprobado' || v.estado === 'Rechazado'
        );

        // Filtro de seguridad: Solo mostrar vacaciones del usuario actual
        const currentCedula = this.authService.getEmpleadoCedula();
        if (currentCedula) {
          this.vacaciones = this.vacaciones.filter(v => v.empleadoId === currentCedula);
        }

        // Mostrar resumen si hay vacaciones procesadas
        const aprobadas = this.vacaciones.filter(v => v.estado === 'Aprobado');
        const rechazadas = this.vacaciones.filter(v => v.estado === 'Rechazado');
        
        if (aprobadas.length > 0 || rechazadas.length > 0) {
          const partes: string[] = [];
          if (aprobadas.length > 0) {
            partes.push(`${aprobadas.length} aprobada(s)`);
          }
          if (rechazadas.length > 0) {
            partes.push(`${rechazadas.length} rechazada(s)`);
          }
          
          this.snackBar.open(`Resumen: ${partes.join(' y ')}.`, 'Cerrar', { duration: 5000 });
        } else if (this.vacaciones.length === 0) {
          this.snackBar.open('No tiene solicitudes de vacaciones', 'Cerrar', { duration: 3000 });
        }
        
        this.loading = false;
      },
      error: (err: any) => {
        let mensaje = 'No se pudieron cargar las vacaciones';
        
        switch (err.status) {
          case 401:
            mensaje = 'Sesión expirada. Por favor, vuelva a iniciar sesión';
            if (!this.authService.getToken()) {
              setTimeout(() => this.router.navigate(['/login']), 2000);
            }
            break;
          case 403:
            mensaje = 'Error de permisos. Intente recargar la página';
            break;
          case 500:
            mensaje = 'Error interno del servidor. Verifique que el backend esté funcionando';
            break;
          case 0:
            mensaje = 'No se pudo conectar al servidor. Verifique su conexión';
            break;
        }
        
        this.error = mensaje;
        this.loading = false;
        
        const snackBarRef = this.snackBar.open(mensaje, 'Reintentar', { duration: 0 });
        snackBarRef.onAction().subscribe(() => this.cargarVacaciones());
      }
    });
  }

  solicitarVacacion(): void {
    // Crear una solicitud por defecto con fecha mínima como hoy
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const solicitudDefault = {
      estado: 'Pendiente' as 'Pendiente',
      fechaInicio: hoy.toISOString().split('T')[0],
      fechaFin: manana.toISOString().split('T')[0]
    };

    // Abrir el diálogo con los valores por defecto
    const dialogRef = this.dialog.open(VacacionesDialogComponent, {
      width: '500px',
      data: solicitudDefault
    });

    // Manejar el resultado cuando se cierre el diálogo
    dialogRef.afterClosed().subscribe((resultado: any) => {
      if (!resultado) {
        return; // Usuario canceló
      }

      // Validar fechas antes de enviar
      const hoyDate = new Date();
      hoyDate.setHours(0,0,0,0);
      const inicioDate = new Date(resultado.fechaInicio);
      inicioDate.setHours(0,0,0,0);
      const finDate = new Date(resultado.fechaFin);
      finDate.setHours(0,0,0,0);

      if (inicioDate < hoyDate) {
        this.snackBar.open('La fecha de inicio no puede ser en el pasado', 'Cerrar', { duration: 3000 });
        return;
      }

      if (finDate < inicioDate) {
        this.snackBar.open('La fecha de fin debe ser posterior a la fecha de inicio', 'Cerrar', { duration: 3000 });
        return;
      }

        // Verificar autenticación antes de proceder
        const token = this.authService.getToken();
        if (!token) {
          this.snackBar.open('Sesión expirada. Por favor, vuelva a iniciar sesión.', 'Cerrar', { duration: 5000 });
          return;
        }

        // Agregar la cédula del empleado autenticado correctamente
        const empleadoCedula = this.authService.getEmpleadoCedula();
        const empleadoId = this.authService.getEmpleadoId();
        
        if (!empleadoCedula && !empleadoId) {
          this.snackBar.open('No se pudo identificar el empleado. Intente cerrar sesión y volver a ingresar.', 'Cerrar', { duration: 5000 });
          return;
        }
        
        const identificadorEmpleado = empleadoCedula || empleadoId?.toString() || '';
        
        const solicitudCompleta = {
          ...resultado,
          empleadoId: identificadorEmpleado
        };

  this.vacacionesService.createVacacionEmpleado(solicitudCompleta).subscribe({
          next: () => {
            this.snackBar.open('Solicitud de vacaciones enviada correctamente', 'Cerrar', {
              duration: 3000
            });
            this.cargarVacaciones(); // Recargar la lista
          },
          error: (err: any) => {
            let mensaje = 'Error al enviar la solicitud de vacaciones';

            // Manejo específico según el error
            if (err?.status === 400) {
              mensaje = 'Los datos de la solicitud no son válidos';
              if (err.error?.message) {
                mensaje += ': ' + err.error.message;
              }
            } else if (err?.status === 401) {
              mensaje = 'No estás autenticado. Por favor, vuelve a iniciar sesión';
            } else if (err?.status === 403) {
              mensaje = 'No tienes permisos para realizar esta acción';
            } else if (err?.status === 409) {
              mensaje = 'Ya tienes una solicitud en esas fechas';
            } else if (err?.status === 500) {
              mensaje = 'Error interno del servidor';
              if (err.error?.message) {
                mensaje += ': ' + err.error.message;
              }
            } else if (err?.status === 0) {
              mensaje = 'No se puede conectar con el servidor';
            }

            this.snackBar.open(mensaje, 'Cerrar', {
              duration: 5000
            });
          }
        });
    });
  }

  /**
   * Cancelar una solicitud de vacaciones
   * Solo permitido para solicitudes en estado 'Pendiente'
   */
  cancelarSolicitud(vacacion: Vacacion): void {
    if (vacacion.estado !== 'Pendiente') {
      this.snackBar.open('Solo se pueden cancelar solicitudes pendientes', 'Cerrar', { duration: 3000 });
      return;
    }

    const confirmacion = confirm(`¿Está seguro que desea cancelar la solicitud de vacaciones #${vacacion.id}?`);
    if (!confirmacion) {
      return;
    }

    this.loading = true;

    // Usar el método delete del servicio
    this.vacacionesService.delete(vacacion.id).subscribe({
      next: () => {
        this.snackBar.open('Solicitud cancelada exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarVacaciones(); // Recargar la lista
      },
      error: (err: any) => {
        let mensaje = 'Error al cancelar la solicitud';
        
        if (err.status === 403) {
          mensaje = 'No tiene permisos para cancelar esta solicitud';
        } else if (err.status === 404) {
          mensaje = 'La solicitud no existe';
        } else if (err.status === 409) {
          mensaje = 'La solicitud ya fue procesada y no se puede cancelar';
        } else if (err.status === 401) {
          mensaje = 'Sesión expirada. Por favor, vuelva a iniciar sesión';
        } else if (err.status === 0) {
          mensaje = 'No se puede conectar con el servidor';
        }
        
        this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Verificar si se puede cancelar una solicitud
   * Solo las solicitudes 'Pendiente' pueden ser canceladas
   */
  puedeCancelar(vacacion: Vacacion): boolean {
    return vacacion.estado === 'Pendiente';
  }
}