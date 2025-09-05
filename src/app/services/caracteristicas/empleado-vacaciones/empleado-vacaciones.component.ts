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
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class EmpleadoVacacionesComponent implements OnInit {
  vacaciones: Vacacion[] = [];
  loading = false;
  error = '';
  displayedColumns: string[] = ['id', 'empleadoId', 'fechaInicio', 'fechaFin', 'estado', 'motivo', 'fechaAprobacion', 'acciones'];
  userInfo: any;

  constructor(
    private vacacionesService: VacacionesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router
  ) {
    this.userInfo = this.authService.getUserInfo();
  }

  ngOnInit(): void {
    this.debugLocalStorage();
    
    // Verificación más permisiva para debugging
    const token = this.authService.getToken();
    const username = this.authService.getUsername();
    
    console.log('🔍 Verificación de sesión menos restrictiva:', {
      hasToken: !!token,
      hasUsername: !!username,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO DISPONIBLE'
    });
    
    if (!token) {
      console.error('❌ No hay token - Redirigiendo al login');
      this.snackBar.open('No hay sesión activa. Redirigiendo al login...', 'Cerrar', { duration: 3000 });
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }
    
    // Continuar aunque no tenga todos los datos, pero mostrar warning
    if (!username) {
      console.warn('⚠️ Falta username, pero hay token. Continuando...');
    }
    
    this.waitForEmpleadoIdAndLoad();
  }

  private debugLocalStorage(): void {
    console.log('🔍 Debug localStorage:', {
      token: localStorage.getItem('token') ? `${localStorage.getItem('token')?.substring(0, 20)}...` : 'NO DISPONIBLE',
      username: localStorage.getItem('username'),
      rol: localStorage.getItem('rol'),
      empleadoId: localStorage.getItem('empleadoId'),
      empleadoCedula: localStorage.getItem('empleadoCedula'),
      empleadoNombre: localStorage.getItem('empleadoNombre')
    });
  }

  waitForEmpleadoIdAndLoad() {
    const check = () => {
      const empleadoCedula = this.authService.getEmpleadoCedula();
      const empleadoId = this.authService.getEmpleadoId();
      const token = this.authService.getToken();
      
      console.log('🔍 Estado de autenticación:', {
        empleadoCedula,
        empleadoId,
        token: token ? `${token.substring(0, 20)}...` : 'NO DISPONIBLE',
        hasToken: !!token
      });
      
      // Verificar que tenemos token
      if (!token) {
        console.error('❌ No hay token de autenticación disponible');
        this.error = 'No hay token de autenticación. Por favor, vuelva a iniciar sesión.';
        return;
      }
      
      // Si tenemos cédula O empleadoId, procedemos
      if (empleadoCedula || empleadoId) {
        console.log('✅ Identificación del empleado encontrada:', { empleadoCedula, empleadoId });
        this.cargarVacaciones();
      } else {
        console.log('⏳ Esperando identificación del empleado...');
        setTimeout(check, 200); // Espera 200ms y vuelve a intentar
      }
    };
    check();
  }

  cargarVacaciones(): void {
    this.loading = true;
    this.error = '';

    // Verificar token antes de hacer la solicitud
    const token = this.authService.getToken();
    if (!token) {
      console.error('❌ No hay token disponible para cargar vacaciones');
      this.error = 'Sesión expirada. Por favor, vuelva a iniciar sesión.';
      this.loading = false;
      return;
    }

    // Cargar solo las vacaciones del empleado autenticado
    console.log('🔍 Cargando vacaciones del empleado autenticado:', {
      token: `${token.substring(0, 20)}...`,
      username: this.authService.getUsername(),
      empleadoCedula: this.authService.getEmpleadoCedula()
    });

    // Usar endpoint basado en autenticación: GET /api/vacaciones/empleado
    this.vacacionesService.getVacacionesEmpleado().subscribe({
      next: (data: Vacacion[]) => {
        console.log('✅ Vacaciones recibidas:', data);
        this.vacaciones = data.filter(v => v.estado === 'Pendiente' || v.estado === 'Aprobado' || v.estado === 'Rechazado');

        // Mostrar snackbar si hay aprobadas o rechazadas
        const aprobadas = this.vacaciones.filter(v => v.estado === 'Aprobado');
        const rechazadas = this.vacaciones.filter(v => v.estado === 'Rechazado');
        if ((aprobadas && aprobadas.length > 0) || (rechazadas && rechazadas.length > 0)) {
          const partes: string[] = [];
          if (aprobadas.length > 0) {
            partes.push(`${aprobadas.length} aprobada(s)`);
          }
          if (rechazadas.length > 0) {
            partes.push(`${rechazadas.length} rechazada(s)`);
          }
          const msg = `Resumen: ${partes.join(' y ')}.`;
          this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
        }
        if (!this.vacaciones || this.vacaciones.length === 0) {
          this.snackBar.open('No tiene solicitudes de vacaciones (0 solicitudes)', 'Cerrar', { duration: 3000 });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar las vacaciones del empleado:', err);
        console.error('📊 Detalles del error:', {
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          error: err.error
        });
        let mensaje = 'No se pudieron cargar las vacaciones';
        if (err.status === 401) {
          mensaje = 'Sesión expirada. Por favor, vuelva a iniciar sesión';
        } else if (err.status === 403) {
          mensaje = 'No tiene permisos para ver las vacaciones';
        } else if (err.status === 500) {
          mensaje = 'Error interno del servidor';
        }
        this.error = mensaje;
        this.loading = false;
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
    dialogRef.afterClosed().subscribe(resultado => {
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
        
        console.log('🔍 Verificando identificación del empleado:', {
          empleadoCedula,
          empleadoId,
          token: `${token.substring(0, 20)}...`,
          username: this.authService.getUsername()
        });
        
        if (!empleadoCedula && !empleadoId) {
          console.error('❌ No se pudo obtener identificación del empleado');
          this.snackBar.open('No se pudo identificar el empleado. Intente cerrar sesión y volver a ingresar.', 'Cerrar', { duration: 5000 });
          return;
        }
        
        const identificadorEmpleado = empleadoCedula || empleadoId?.toString() || '';
        console.log('💔 Identificador de empleado a usar:', identificadorEmpleado);
        
        const solicitudCompleta = {
          ...resultado,
          empleadoId: identificadorEmpleado // enviamos empleadoId con valor de cédula (string)
        };
        console.log('📦 Solicitud completa a enviar:', solicitudCompleta);

  this.vacacionesService.createVacacionEmpleado(solicitudCompleta).subscribe({
          next: () => {
            this.snackBar.open('Solicitud de vacaciones enviada correctamente', 'Cerrar', {
              duration: 3000
            });
            this.cargarVacaciones(); // Recargar la lista
          },
          error: (err) => {
            console.error('❌ Error completo al crear solicitud:', err);
            console.error('📊 Status:', err.status);
            console.error('📋 StatusText:', err.statusText);
            console.error('🔍 Error body:', err.error);
            console.error('💾 Datos que se enviaron:', solicitudCompleta);
            
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
}