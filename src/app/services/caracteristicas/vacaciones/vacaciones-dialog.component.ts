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
import { VacacionForm } from './vacaciones-list.component';

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
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.id ? 'Editar' : 'Nueva' }} solicitud de vacaciones</h2>
    <mat-dialog-content>
      <form #vacacionForm="ngForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha de inicio</mat-label>
          <input matInput [matDatepicker]="startPicker" [(ngModel)]="data.fechaInicio" name="fechaInicio" required>
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
          <mat-error>La fecha de inicio es obligatoria</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha de fin</mat-label>
          <input matInput [matDatepicker]="endPicker" [(ngModel)]="data.fechaFin" name="fechaFin" required>
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
  `]
})
export class VacacionesDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<VacacionesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VacacionForm
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
    this.dialogRef.close(this.data);
  }
}
