import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Vacacion, VacacionesService } from '../../vacaciones.service';

    @Component({
    selector: 'app-vacaciones-admin-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatRadioModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatSnackBarModule
    ],
    template: `
        <h2 mat-dialog-title>Gestionar Solicitud de Vacaciones</h2>
        
        <mat-dialog-content>
        <!-- Información de la solicitud (solo lectura) -->
        <mat-card class="vacation-details">
            <mat-card-header>
            <mat-card-title>Detalles de la Solicitud</mat-card-title>
            </mat-card-header>
            <mat-card-content>
            <div class="detail-row">
                <strong>ID:</strong> 
                <span>#{{data.id}}</span>
            </div>
            
            <div class="detail-row">
                <strong>Empleado ID:</strong> 
                <span>{{data.empleadoId || 'N/A'}}</span>
            </div>
            
            <div class="detail-row">
                <strong>Fecha de Inicio:</strong> 
                <span>{{formatDate(data.fechaInicio)}}</span>
            </div>
            
            <div class="detail-row">
                <strong>Fecha de Fin:</strong> 
                <span>{{formatDate(data.fechaFin)}}</span>
            </div>
            
            <div class="detail-row">
                <strong>Días Solicitados:</strong> 
                <span>{{getDiasSolicitados()}} días</span>
            </div>
            
            <div class="detail-row">
                <strong>Motivo:</strong> 
                <span>{{data.motivo || 'Sin motivo especificado'}}</span>
            </div>
            
            <div class="detail-row">
                <strong>Estado Actual:</strong> 
                <span class="status-badge status-{{data.estado.toLowerCase()}}">
                {{data.estado}}
                </span>
            </div>
            </mat-card-content>
        </mat-card>
        
        <!-- Acciones del administrador -->
        <div class="actions-section">
            <h3>Decisión Administrativa</h3>
            <mat-radio-group [(ngModel)]="selectedAction" class="action-radio-group">
            <mat-radio-button 
                value="Aprobado" 
                class="action-option approve"
                [class.selected]="selectedAction === 'Aprobado'">
                <div class="radio-content">
                <span class="icon">✅</span>
                <div class="text">
                    <strong>Aprobar Solicitud</strong>
                    <small>Autorizar las vacaciones solicitadas</small>
                </div>
                </div>
            </mat-radio-button>
            
            <mat-radio-button 
                value="Rechazado" 
                class="action-option reject"
                [class.selected]="selectedAction === 'Rechazado'">
                <div class="radio-content">
                <span class="icon">❌</span>
                <div class="text">
                    <strong>Rechazar Solicitud</strong>
                    <small>Denegar las vacaciones solicitadas</small>
                </div>
                </div>
            </mat-radio-button>
            
            <mat-radio-button 
                value="Pendiente" 
                class="action-option pending"
                [class.selected]="selectedAction === 'Pendiente'">
                <div class="radio-content">
                <span class="icon">⏳</span>
                <div class="text">
                    <strong>Dejar Pendiente</strong>
                    <small>Revisar más tarde</small>
                </div>
                </div>
            </mat-radio-button>
            </mat-radio-group>
            
            <!-- Comentario para rechazo -->
            <mat-form-field 
            appearance="outline" 
            class="full-width" 
            *ngIf="selectedAction === 'Rechazado'">
            <mat-label>Motivo del Rechazo (Opcional)</mat-label>
            <textarea 
                matInput 
                [(ngModel)]="comentarioRechazo" 
                rows="3"
                placeholder="Explica por qué se rechaza la solicitud...">
            </textarea>
            <mat-hint>Este comentario será visible para el empleado</mat-hint>
            </mat-form-field>
        </div>
        </mat-dialog-content>
        
        <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" [disabled]="loading">Cancelar</button>
        <button 
            mat-raised-button 
            color="primary" 
            (click)="onSave()"
            [disabled]="!selectedAction || selectedAction === data.estado || loading">
            <mat-spinner *ngIf="loading" diameter="16" style="margin-right: 8px;"></mat-spinner>
            <span *ngIf="loading">Guardando...</span>
            <span *ngIf="!loading && selectedAction === data.estado">Sin cambios</span>
            <span *ngIf="!loading && selectedAction !== data.estado">Guardar Decisión</span>
        </button>
        </mat-dialog-actions>
    `,
    styles: [`
        mat-dialog-content {
        min-width: 500px;
        max-width: 600px;
        }
        
        .vacation-details {
        margin-bottom: 24px;
        background-color: #f8f9fa;
        }
        
        .detail-row {
        display: flex;
        margin-bottom: 12px;
        align-items: flex-start;
        }
        
        .detail-row strong {
        min-width: 140px;
        color: #333;
        flex-shrink: 0;
        }
        
        .detail-row span {
        flex: 1;
        word-break: break-word;
        }
        
        .status-badge {
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: bold;
        text-transform: uppercase;
        }
        
        .status-pendiente { 
        background-color: #fff3cd; 
        color: #856404; 
        border: 1px solid #ffeaa7;
        }
        .status-aprobado { 
        background-color: #d4edda; 
        color: #155724; 
        border: 1px solid #c3e6cb;
        }
        .status-rechazado { 
        background-color: #f8d7da; 
        color: #721c24; 
        border: 1px solid #f5c6cb;
        }
        
        .actions-section {
        margin-top: 24px;
        }
        
        .actions-section h3 {
        margin-bottom: 16px;
        color: #333;
        font-size: 18px;
        }
        
        .action-radio-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin: 16px 0;
        }
        
        .action-option {
        padding: 0 !important;
        height: auto !important;
        border: 2px solid #e0e0e0;
        border-radius: 12px;
        transition: all 0.3s ease;
        background-color: white;
        }
        
        .action-option:hover {
        background-color: #f5f5f5;
        border-color: #ccc;
        }
        
        .action-option.selected.approve {
        border-color: #4caf50;
        background-color: #e8f5e8;
        }
        
        .action-option.selected.reject {
        border-color: #f44336;
        background-color: #ffeaea;
        }
        
        .action-option.selected.pending {
        border-color: #ff9800;
        background-color: #fff8e1;
        }
        
        .radio-content {
        display: flex;
        align-items: center;
        padding: 16px;
        width: 100%;
        }
        
        .radio-content .icon {
        font-size: 24px;
        margin-right: 16px;
        flex-shrink: 0;
        }
        
        .radio-content .text {
        flex: 1;
        }
        
        .radio-content .text strong {
        display: block;
        margin-bottom: 4px;
        font-size: 16px;
        }
        
        .radio-content .text small {
        color: #666;
        font-size: 14px;
        }
        
        .full-width {
        width: 100%;
        margin-top: 16px;
        }
        
        mat-dialog-actions {
        padding: 16px 24px;
        gap: 8px;
        }
    `]
    })
    export class VacacionesAdminDialogComponent {
    selectedAction: 'Pendiente' | 'Aprobado' | 'Rechazado' = 'Pendiente';
    comentarioRechazo: string = '';
    loading: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<VacacionesAdminDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Vacacion,
        private vacacionesService: VacacionesService,
        private snackBar: MatSnackBar
    ) {
        this.selectedAction = (data.estado as 'Pendiente' | 'Aprobado' | 'Rechazado') || 'Pendiente';
    }

    formatDate(dateString: string): string {
        if (!dateString) {
        return 'N/A';
        }
        try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        } catch {
        return dateString;
        }
    }

    getDiasSolicitados(): number {
        if (this.data.fechaInicio && this.data.fechaFin) {
        const inicio = new Date(this.data.fechaInicio);
        const fin = new Date(this.data.fechaFin);
        const diferencia = fin.getTime() - inicio.getTime();
        return Math.ceil(diferencia / (1000 * 3600 * 24)) + 1;
        }
        return this.data.dias || 0;
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSave(): void {
        if (this.loading) {
        return;
        }

        this.loading = true;
        
        console.log('🔄 Intentando actualizar vacación:', {
        id: this.data.id,
        estadoActual: this.data.estado,
        nuevoEstado: this.selectedAction,
        comentarioRechazo: this.comentarioRechazo
        });

        const updatedData: Partial<Vacacion> = {
        ...this.data,
        estado: this.selectedAction
        };

        // Si se rechaza y hay comentario, incluirlo
        if (this.selectedAction === 'Rechazado' && this.comentarioRechazo.trim()) {
        (updatedData as any).comentarioRechazo = this.comentarioRechazo.trim();
        }

        this.vacacionesService.update(this.data.id, updatedData).subscribe({
        next: (response) => {
            console.log('✅ Respuesta del servidor:', response);
            this.loading = false;
            this.snackBar.open('Estado de vacación actualizado correctamente', 'OK', {
            duration: 3000
            });
            this.dialogRef.close(response);
        },
        error: (error) => {
            console.error('❌ Error completo:', error);
            this.loading = false;
            
            let errorMessage = 'Error desconocido al actualizar la vacación';
            if (error.error?.message) {
            errorMessage = error.error.message;
            } else if (error.message) {
            errorMessage = error.message;
            } else if (error.status) {
            errorMessage = `Error HTTP ${error.status}: ${error.statusText || 'Error del servidor'}`;
            }
            
            this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
            });
        }
        });
    }
    }
