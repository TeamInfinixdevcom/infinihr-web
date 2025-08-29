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
  displayedColumns: string[] = ['id', 'fechaInicio', 'fechaFin', 'estado', 'motivo', 'acciones'];
  userInfo: any;

  constructor(
    private vacacionesService: VacacionesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.userInfo = this.authService.getUserInfo();
  }

  ngOnInit(): void {
    this.cargarVacaciones();
  }

  cargarVacaciones(): void {
    this.loading = true;
    this.error = '';

    // Cargar solo las vacaciones del empleado autenticado
    this.vacacionesService.getVacacionesEmpleado().subscribe({
      next: (data: Vacacion[]) => {
        console.log('Vacaciones recibidas:', data);
        this.vacaciones = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar las vacaciones del empleado:', err);
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

      // Agregar el empleado_id del usuario autenticado
      console.log('👤 Info del usuario actual:', this.userInfo);
      const empleadoId = parseInt(this.userInfo?.id || '1');
      console.log('🆔 ID de empleado a usar:', empleadoId);
      
      const solicitudCompleta = {
        ...resultado,
        empleadoId: empleadoId  // Cambiar a camelCase
      };
      
      console.log('📦 Solicitud completa a enviar:', solicitudCompleta);

      this.vacacionesService.create(solicitudCompleta).subscribe({
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