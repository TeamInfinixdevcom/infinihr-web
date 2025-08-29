import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { VacacionesService, Vacacion } from '../../vacaciones.service';
import { VacacionesDialogComponent } from './vacaciones-dialog.component';

export interface VacacionForm {
  id?: number;
  empleadoId?: number;  // Cambiar a camelCase
  fechaInicio: string;
  fechaFin: string;
  dias?: number | null;
  motivo: string | null;
  estado: string;
}

@Component({
  selector: 'app-vacaciones-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './vacaciones-list.component.html',
  styleUrls: ['./vacaciones-list.component.scss']
})
export class VacacionesListComponent implements OnInit {
  vacaciones: Vacacion[] = [];
  displayedColumns: string[] = ['id', 'empleado', 'fechaInicio', 'fechaFin', 'estado', 'motivo', 'acciones'];
  loading = false;
  error = '';
  dataSource = new MatTableDataSource<Vacacion>([]);
  
  // Variables para la interfaz completa
  cols: string[] = ['id', 'empleadoId', 'fechaInicio', 'fechaFin', 'estado', 'acciones'];
  filters: any = {
    estado: '',
    desde: null,
    hasta: null
  };
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public api: VacacionesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadVacaciones();
  }

  loadVacaciones(): void {
    this.loading = true;
    this.error = '';
    
    // Verificar explícitamente si tenemos un token
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    console.log('🔐 Estado de autenticación al cargar vacaciones:', { 
      token: !!token, 
      username,
      tokenPreview: token ? token.substring(0, 30) + '...' : 'No disponible'
    });
    
    // Ahora usamos el método list() que está implementado como alias de getVacaciones()
    this.api.list().subscribe({
      next: (data: Vacacion[]) => {
        console.log('✅ Vacaciones cargadas exitosamente:', data);
        this.vacaciones = data || [];
        this.dataSource.data = this.vacaciones;
        this.loading = false;
        
        // Mostrar mensaje informativo
        if (this.vacaciones.length === 0) {
          this.snackBar.open('No hay vacaciones registradas', 'OK', {
            duration: 3000
          });
        } else {
          this.snackBar.open(`${this.vacaciones.length} vacaciones cargadas`, 'OK', {
            duration: 2000
          });
        }
      },
      error: (err: any) => {
        console.error('❌ Error al cargar vacaciones:', err);
        this.dataSource.data = [];
        
        // Manejo específico para error 403 (Forbidden)
        if (err.status === 403) {
          this.error = `⚠️ Acceso denegado al servidor. Usando datos de prueba.`;
          console.log('🔄 El servicio debería haber proporcionado datos simulados automáticamente');
          
          this.snackBar.open('Problemas de autenticación. Mostrando datos de prueba.', 'Entendido', {
            duration: 5000
          });
        } else if (err.status === 401) {
          this.error = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          this.snackBar.open('Sesión expirada', 'Ir a login', {
            duration: 5000
          });
        } else if (err.status === 0) {
          this.error = 'No se puede conectar con el servidor. Verifica que esté ejecutándose.';
          this.snackBar.open('Error de conexión con el servidor', 'Reintentar', {
            duration: 5000
          }).onAction().subscribe(() => {
            this.loadVacaciones();
          });
        } else {
          this.error = `Error del servidor: ${err.status} - ${err.statusText}`;
        }
        
        this.loading = false;
      }
    });
  }
  
  refresh(): void {
    this.loadVacaciones();
  }
  
  openCreate(): void {
    this.openDialog();
  }
  
  openEdit(vacacion: Vacacion): void {
    this.openDialog(vacacion);
  }
  
  applySearch(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    // Aquí implementarías la lógica de filtrado
    console.log('Buscando:', filterValue);
  }
  
  applyFilters(): void {
    // Aquí implementarías la lógica de filtrado por estado y fechas
    console.log('Aplicando filtros:', this.filters);
  }
  
  clearFilters(): void {
    this.filters = {
      estado: '',
      desde: null,
      hasta: null
    };
    this.loadVacaciones();
  }
  
  confirmDelete(vacacion: Vacacion): void {
    if (confirm(`¿Estás seguro de eliminar la solicitud de vacaciones #${vacacion.id}?`)) {
      this.deleteVacacion(vacacion.id);
    }
  }

  openDialog(vacacion?: Vacacion): void {
    const data: VacacionForm = vacacion ? { 
      id: vacacion.id,
      empleadoId: vacacion.empleadoId,
      fechaInicio: vacacion.fechaInicio,
      fechaFin: vacacion.fechaFin,
      dias: vacacion.dias,
      motivo: vacacion.motivo,
      estado: vacacion.estado
    } : {
      fechaInicio: '',
      fechaFin: '',
      motivo: '',
      estado: 'Pendiente'
    };

    const dialogRef = this.dialog.open(VacacionesDialogComponent, {
      width: '500px',
      data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.updateVacacion(result.id, result);
        } else {
          this.createVacacion(result);
        }
      }
    });
  }

  createVacacion(vacacion: VacacionForm): void {
    this.api.create(vacacion as Vacacion).subscribe({
      next: () => {
        this.snackBar.open('Vacación creada correctamente', 'Cerrar', { duration: 3000 });
        this.loadVacaciones();
      },
      error: err => {
        console.error('Error al crear vacación:', err);
        this.snackBar.open('Error al crear la vacación', 'Cerrar', { duration: 3000 });
      }
    });
  }

  updateVacacion(id: number, vacacion: VacacionForm): void {
    this.api.update(id, vacacion as Vacacion).subscribe({
      next: () => {
        this.snackBar.open('Vacación actualizada correctamente', 'Cerrar', { duration: 3000 });
        this.loadVacaciones();
      },
      error: err => {
        console.error('Error al actualizar vacación:', err);
        this.snackBar.open('Error al actualizar la vacación', 'Cerrar', { duration: 3000 });
      }
    });
  }

  deleteVacacion(id: number): void {
    this.api.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Vacación eliminada correctamente', 'Cerrar', { duration: 3000 });
        this.loadVacaciones();
      },
      error: err => {
        console.error('Error al eliminar vacación:', err);
        this.snackBar.open('Error al eliminar la vacación', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
