import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { VacacionForm } from './vacaciones-list.component';
import { EmpleadosService, Empleado } from '../../empleados.service';

@Component({
  selector: 'app-vacaciones-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.id ? 'Editar' : 'Nueva' }} solicitud de vacaciones</h2>
    
    <!-- Alerta informativa para administradores creando -->
    <div *ngIf="data.isAdminCreating" class="admin-creating-alert">
      <mat-icon>admin_panel_settings</mat-icon>
      <div class="alert-content">
        <strong>Creando como Administrador</strong>
        <p>Estás creando una solicitud en nombre de un empleado. Asegúrate de verificar las fechas y el motivo.</p>
      </div>
    </div>
    
    <mat-dialog-content>
      <form #vacacionForm="ngForm">
        <!-- Selector de empleado para administradores -->
        <mat-form-field appearance="outline" class="full-width" *ngIf="isAdminCreating">
          <mat-label>Seleccionar Empleado *</mat-label>
          <mat-select [(ngModel)]="selectedEmpleadoId" name="selectedEmpleado" required>
            <mat-option *ngFor="let empleado of empleados" [value]="empleado.id">
              {{empleado.nombre}} - {{empleado.puesto}} ({{empleado.username}})
            </mat-option>
          </mat-select>
          <mat-hint>Selecciona el empleado para quien crear la solicitud</mat-hint>
          <mat-error>Debes seleccionar un empleado</mat-error>
        </mat-form-field>
        

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha de inicio</mat-label>
          <input matInput [matDatepicker]="startPicker" [(ngModel)]="data.fechaInicio" name="fechaInicio" required [min]="minFechaInicio">
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
          <mat-error>La fecha de inicio es obligatoria</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha de fin</mat-label>
          <input matInput [matDatepicker]="endPicker" [(ngModel)]="data.fechaFin" name="fechaFin" required [min]="data.fechaInicio">
          <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
          <mat-error>La fecha de fin es obligatoria</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motivo</mat-label>
          <textarea matInput [(ngModel)]="data.motivo" name="motivo" rows="3"></textarea>
          <mat-error>El motivo es obligatorio</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Días</mat-label>
          <input matInput type="number" [(ngModel)]="data.dias" name="dias" min="1" readonly>
          <mat-hint>Número de días de vacaciones</mat-hint>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width" *ngIf="data.id">
          <mat-label>Estado</mat-label>
          <mat-select [(ngModel)]="data.estado" name="estado" required>
            <mat-option value="Pendiente">Pendiente</mat-option>
            <mat-option value="Aprobado">Aprobado</mat-option>
            <mat-option value="Rechazado">Rechazado</mat-option>
          </mat-select>
          <mat-error>El estado es obligatorio</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="vacacionForm.invalid" (click)="onSubmit()">
        {{ data.id ? 'Actualizar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    mat-dialog-content {
      min-width: 300px;
      max-width: 500px;
    }
    
    .admin-creating-alert {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
      border: 1px solid #2196f3;
      border-radius: 8px;
      color: #1565c0;
      border-left: 4px solid #2196f3;
    }
    
    .admin-creating-alert mat-icon {
      color: #2196f3;
      margin-top: 2px;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .alert-content {
      flex: 1;
    }
    
    .alert-content strong {
      display: block;
      margin-bottom: 4px;
      font-weight: 600;
      color: #1976d2;
    }
    
    .alert-content p {
      margin: 0;
      font-size: 14px;
      line-height: 1.4;
      color: #1565c0;
    }
  `]
})
export class VacacionesDialogComponent implements OnInit {
  empleados: Empleado[] = [];
  selectedEmpleadoId: number | null = null;
  isAdminCreating: boolean = false;
  minFechaInicio: Date = new Date();

  constructor(
    public dialogRef: MatDialogRef<VacacionesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VacacionForm,
    private empleadosService: EmpleadosService
  ) {
    // Inicializar con valores por defecto si es necesario
    this.data = {
      ...{
        fechaInicio: '',
        fechaFin: '',
        motivo: '',
        estado: 'Pendiente'
      },
      ...this.data
    };
    
    this.isAdminCreating = this.data.isAdminCreating || false;
  }

  ngOnInit() {
    // Calcular días automáticamente cuando cambian las fechas
    Object.defineProperty(this.data, 'fechaInicio', {
      set: (value: any) => {
        this._fechaInicio = value;
        this.calcularDias();
      },
      get: () => this._fechaInicio,
      configurable: true
    });
    Object.defineProperty(this.data, 'fechaFin', {
      set: (value: any) => {
        this._fechaFin = value;
        this.calcularDias();
      },
      get: () => this._fechaFin,
      configurable: true
    });
    this._fechaInicio = this.data.fechaInicio;
    this._fechaFin = this.data.fechaFin;
    
    // Cargar empleados si es admin creando
    if (this.isAdminCreating) {
      this.loadEmpleados();
    }
  }

  private loadEmpleados(): void {
    console.log('📋 Cargando empleados para selector...');
    this.empleadosService.getAll().subscribe({
      next: (empleados) => {
        this.empleados = empleados;
        console.log('✅ Empleados cargados:', empleados);
      },
      error: (error) => {
        console.error('❌ Error cargando empleados:', error);
        // Datos de respaldo si falla la API
        this.empleados = [
          { id: 3, nombre: 'Administrador del Sistema', correo: 'admin@infinihr.com', puesto: 'Administrador', fecha_ingreso: '2025-01-01', username: 'admin' },
          { id: 4, nombre: 'Juan Pérez', correo: 'juan.perez@infinihr.com', puesto: 'Desarrollador', fecha_ingreso: '2025-01-15', username: 'empleado' },
          { id: 1, nombre: 'Juan Pérez', correo: 'juan@infinihr.com', puesto: 'Desarrollador', fecha_ingreso: '2025-07-30', username: 'usuario_1' },
          { id: 2, nombre: 'Ana Mora', correo: 'ana.mora@empresa.com', puesto: 'Desarrollador Junior', fecha_ingreso: '', username: 'usuario_2' }
        ];
      }
    });
  }

  private _fechaInicio: any;
  private _fechaFin: any;

  calcularDias() {
    if (this._fechaInicio && this._fechaFin) {
      const inicio = new Date(this._fechaInicio);
      const fin = new Date(this._fechaFin);
      const diff = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
      this.data.dias = diff >= 0 ? diff + 1 : 1;
    } else {
      this.data.dias = 1;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    // Formatear fechas si es necesario
    const { fechaInicio, fechaFin } = this.data;
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    let inicio = fechaInicio;
    let fin = fechaFin;
    if (fechaInicio && typeof fechaInicio !== 'string') {
      inicio = new Date(fechaInicio).toISOString().split('T')[0];
      this.data.fechaInicio = inicio;
    }
    if (fechaFin && typeof fechaFin !== 'string') {
      fin = new Date(fechaFin).toISOString().split('T')[0];
      this.data.fechaFin = fin;
    }
    
    // Validar fechas correctamente
    if (new Date(inicio) < hoy) {
      alert('La fecha de inicio no puede ser en el pasado');
      return;
    }
    if (new Date(fin) < new Date(inicio)) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }
    
    // Si es admin creando, validar que haya seleccionado empleado
    if (this.isAdminCreating && !this.selectedEmpleadoId) {
      alert('Debes seleccionar un empleado para crear la solicitud');
      return;
    }
    
    // Preparar datos para enviar
    const dataToSend = { ...this.data };
    if (this.isAdminCreating) {
      dataToSend.empleadoId = this.selectedEmpleadoId!;
    }
    
    this.dialogRef.close(dataToSend);
  }
}
