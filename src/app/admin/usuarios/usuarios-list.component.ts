import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';

import { UsuariosService, UsuarioCompleto } from '../../services/usuarios.service';
import { UsuarioDialogComponent } from './usuario-dialog.component';

@Component({
    selector: 'app-usuarios-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatSnackBarModule,
        MatCardModule,
        MatToolbarModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatTooltipModule
    ],
    template: `
        <mat-card>
            <mat-card-header>
                <mat-card-title>
                    <mat-toolbar color="primary">
                        <span>Gestión de Usuarios</span>
                        <span class="spacer"></span>
                        <button mat-raised-button color="accent" (click)="openCreateDialog()">
                            <mat-icon>add</mat-icon>
                            Nuevo Usuario
                        </button>
                    </mat-toolbar>
                </mat-card-title>
            </mat-card-header>

            <mat-card-content>
                <div *ngIf="loading" class="loading-container">
                    <mat-spinner></mat-spinner>
                    <p>Cargando usuarios...</p>
                </div>

                <div *ngIf="!loading">
                    <table mat-table [dataSource]="usuarios" class="usuarios-table mat-elevation-4">

                        <ng-container matColumnDef="id">
                            <th mat-header-cell *matHeaderCellDef>ID</th>
                            <td mat-cell *matCellDef="let usuario">{{ usuario.id }}</td>
                        </ng-container>

                        <ng-container matColumnDef="username">
                            <th mat-header-cell *matHeaderCellDef>Usuario</th>
                            <td mat-cell *matCellDef="let usuario">{{ usuario.username }}</td>
                        </ng-container>

                        <ng-container matColumnDef="email">
                            <th mat-header-cell *matHeaderCellDef>Email</th>
                            <td mat-cell *matCellDef="let usuario">{{ usuario.email }}</td>
                        </ng-container>

                        <ng-container matColumnDef="nombreCompleto">
                            <th mat-header-cell *matHeaderCellDef>Nombre Completo</th>
                            <td mat-cell *matCellDef="let usuario">{{ usuario.nombre }} {{ usuario.apellidos }}</td>
                        </ng-container>

                        <ng-container matColumnDef="departamento">
                            <th mat-header-cell *matHeaderCellDef>Departamento</th>
                            <td mat-cell *matCellDef="let usuario">{{ usuario.departamento?.nombre || 'Sin asignar' }}</td>
                        </ng-container>

                        <ng-container matColumnDef="puesto">
                            <th mat-header-cell *matHeaderCellDef>Puesto</th>
                            <td mat-cell *matCellDef="let usuario">{{ usuario.puesto?.nombre || 'Sin asignar' }}</td>
                        </ng-container>

                        <ng-container matColumnDef="role">
                            <th mat-header-cell *matHeaderCellDef>Rol</th>
                            <td mat-cell *matCellDef="let usuario">
                                <mat-chip [color]="usuario.rol === 'ADMIN' ? 'primary' : 'accent'">{{ usuario.rol }}</mat-chip>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="activo">
                            <th mat-header-cell *matHeaderCellDef>Estado</th>
                            <td mat-cell *matCellDef="let usuario">
                                <mat-chip [color]="usuario.activo ? 'primary' : 'warn'">{{ usuario.activo ? 'Activo' : 'Inactivo' }}</mat-chip>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="actions">
                            <th mat-header-cell *matHeaderCellDef>Acciones</th>
                            <td mat-cell *matCellDef="let usuario">
                                <button mat-icon-button color="primary" (click)="openEditDialog(usuario)" matTooltip="Editar usuario">
                                    <mat-icon>edit</mat-icon>
                                </button>
                                <button mat-icon-button [color]="usuario.activo ? 'warn' : 'accent'" (click)="toggleUserStatus(usuario)" [matTooltip]="usuario.activo ? 'Desactivar usuario' : 'Activar usuario'">
                                    <mat-icon>{{ usuario.activo ? 'lock' : 'lock_open' }}</mat-icon>
                                </button>
                                <button mat-icon-button color="warn" (click)="deleteUser(usuario)" matTooltip="Eliminar usuario" [disabled]="usuario.rol === 'ADMIN'">
                                    <mat-icon>delete</mat-icon>
                                </button>
                            </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                    </table>

                    <div *ngIf="usuarios.length === 0" class="no-data">
                        <mat-icon>person_off</mat-icon>
                        <p>No hay usuarios registrados</p>
                        <button mat-raised-button color="primary" (click)="openCreateDialog()">Crear Primer Usuario</button>
                    </div>
                </div>
            </mat-card-content>
        </mat-card>
    `,
    styles: [
        `
            .spacer { flex: 1 1 auto; }
            .loading-container { display: flex; flex-direction: column; align-items: center; padding: 40px; }
            .usuarios-table { width: 100%; margin-top: 20px; }
            .no-data { text-align: center; padding: 40px; color: #666; }
            .no-data mat-icon { font-size: 48px; height: 48px; width: 48px; margin-bottom: 16px; }
            mat-card { margin: 20px; }
            mat-toolbar { border-radius: 4px 4px 0 0; }
            .mat-mdc-table { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .mat-column-actions { width: 120px; text-align: center; }
            .mat-column-id { width: 60px; }
            .mat-column-role, .mat-column-activo { width: 100px; text-align: center; }
        `
    ]
})
export class UsuariosListComponent implements OnInit, OnDestroy {
    usuarios: UsuarioCompleto[] = [];
    displayedColumns: string[] = ['id','username','email','nombreCompleto','departamento','puesto','role','activo','actions'];
    loading = false;
    private destroy$ = new Subject<void>();

    constructor(
        private usuariosService: UsuariosService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.loadUsuarios();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadUsuarios(): void {
        this.loading = true;
        this.usuariosService.getUsuariosCompletos()
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (usuarios: UsuarioCompleto[]) => {
                    this.usuarios = usuarios;
                    this.loading = false;
                },
                (error: any) => {
                        console.error('Error al cargar usuarios:', error);
                        // Mostrar información más útil al usuario y en consola
                        const status = error?.status ?? 'desconocido';
                        const statusText = error?.statusText ?? '';
                        const serverMessage = error?.error ? (typeof error.error === 'string' ? error.error : JSON.stringify(error.error)) : '';
                        this.snackBar.open(`Error al cargar usuarios: ${status} ${statusText}`, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
                        console.error('Detalles del error:', { status, statusText, serverMessage });
                        this.loading = false;
                    }
            );
    }

    openCreateDialog(): void {
        const dialogRef = this.dialog.open(UsuarioDialogComponent, { width: '800px', maxHeight: '90vh', data: { isEdit: false } });

        dialogRef.afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe(result => {
                if (result) {
                    this.loadUsuarios();
                    this.snackBar.open('Usuario creado exitosamente', 'Cerrar', { duration: 3000, panelClass: ['success-snackbar'] });
                }
            });
    }

    openEditDialog(usuario: UsuarioCompleto): void {
        const dialogRef = this.dialog.open(UsuarioDialogComponent, { width: '800px', maxHeight: '90vh', data: { isEdit: true, usuario: { ...usuario } } });

        dialogRef.afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe(result => {
                if (result) {
                    this.loadUsuarios();
                    this.snackBar.open('Usuario actualizado exitosamente', 'Cerrar', { duration: 3000, panelClass: ['success-snackbar'] });
                }
            });
    }

    toggleUserStatus(usuario: UsuarioCompleto): void {
        if (usuario.rol === 'ADMIN' && usuario.activo) {
            this.snackBar.open('No se puede desactivar a un administrador', 'Cerrar', { duration: 3000, panelClass: ['warning-snackbar'] });
            return;
        }

        const newStatus = !usuario.activo;
        const action = newStatus ? 'activar' : 'desactivar';

        this.usuariosService.toggleUsuarioActivo(usuario.id!, newStatus)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                () => {
                    usuario.activo = newStatus;
                    this.snackBar.open(`Usuario ${action}do exitosamente`, 'Cerrar', { duration: 3000, panelClass: ['success-snackbar'] });
                },
                (error: any) => {
                    console.error(`Error al ${action} usuario:`, error);
                    
                    // Mensajes más específicos según el tipo de error
                    let mensaje = `Error al ${action} usuario`;
                    
                    if (error.status === 403) {
                        mensaje = `No tiene permisos para ${action} este usuario`;
                        console.warn('⚠️ Error 403 - Problema de permisos, no de autenticación');
                    } else if (error.status === 401) {
                        mensaje = `Su sesión ha expirado, por favor inicie sesión nuevamente`;
                    } else if (error.status === 0) {
                        mensaje = `Error de conexión con el servidor`;
                    } else if (error.message && error.message.includes('expirado')) {
                        mensaje = error.message;
                    }
                    
                    this.snackBar.open(mensaje, 'Cerrar', { duration: 5000, panelClass: ['error-snackbar'] });
                }
            );
    }

    deleteUser(usuario: UsuarioCompleto): void {
        if (usuario.rol === 'ADMIN') {
            this.snackBar.open('No se puede eliminar a un administrador', 'Cerrar', { duration: 3000, panelClass: ['warning-snackbar'] });
            return;
        }

        if (confirm(`¿Está seguro de que desea eliminar al usuario ${usuario.username}?`)) {
            this.usuariosService.deleteUsuario(usuario.id!)
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                    () => {
                        this.loadUsuarios();
                        this.snackBar.open('Usuario eliminado exitosamente', 'Cerrar', { duration: 3000, panelClass: ['success-snackbar'] });
                    },
                    (error: any) => {
                        console.error('Error al eliminar usuario:', error);
                        this.snackBar.open('Error al eliminar usuario', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
                    }
                );
        }
    }
}
