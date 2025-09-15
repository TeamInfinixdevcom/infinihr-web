import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
    import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
    import { MatFormFieldModule } from '@angular/material/form-field';
    import { MatInputModule } from '@angular/material/input';
    import { MatSelectModule } from '@angular/material/select';
    import { MatButtonModule } from '@angular/material/button';
    import { MatIconModule } from '@angular/material/icon';
    import { MatDatepickerModule } from '@angular/material/datepicker';
    import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
    import { MatSlideToggleModule } from '@angular/material/slide-toggle';
    import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
    import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
    import { MatStepperModule } from '@angular/material/stepper';
    import { Subject, takeUntil, forkJoin } from 'rxjs';

    import { 
    UsuariosService, 
    UsuarioCompleto, 
    Genero, 
    EstadoCivil, 
    Nacionalidad, 
    Departamento, 
    Puesto 
    } from '../../services/usuarios.service';
    import { UsuariosMockService } from '../../services/usuarios-mock.service';

    export interface DialogData {
    isEdit: boolean;
    usuario?: UsuarioCompleto;
    }

    @Component({
    selector: 'app-usuario-dialog',
    standalone: true,
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatStepperModule
    ],
    template: `
        <div class="dialog-header">
        <h2 mat-dialog-title>
            {{ data.isEdit ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}
        </h2>
        <button mat-icon-button mat-dialog-close>
            <mat-icon>close</mat-icon>
        </button>
        </div>

        <mat-dialog-content class="dialog-content">
        <mat-stepper linear #stepper *ngIf="!loading">
            
            <!-- Paso 1: Datos de Usuario -->
            <mat-step [stepControl]="userForm" label="Datos de Usuario">
            <form [formGroup]="userForm" class="form-section">
                
                <div class="form-row">
                <mat-form-field appearance="outline">
                    <mat-label>Nombre de Usuario</mat-label>
                    <input matInput formControlName="username" required>
                    <mat-error *ngIf="userForm.get('username')?.hasError('required')">
                    El nombre de usuario es requerido
                    </mat-error>
                    <mat-error *ngIf="userForm.get('username')?.hasError('minlength')">
                    Mínimo 3 caracteres
                    </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="email" required>
                    <mat-error *ngIf="userForm.get('email')?.hasError('required')">
                    El email es requerido
                    </mat-error>
                    <mat-error *ngIf="userForm.get('email')?.hasError('email')">
                    Email inválido
                    </mat-error>
                </mat-form-field>
                </div>

                <div class="form-row">
                <mat-form-field appearance="outline">
                    <mat-label>Contraseña</mat-label>
                    <input matInput type="password" formControlName="password" 
                        [required]="!data.isEdit">
                    <mat-error *ngIf="userForm.get('password')?.hasError('required')">
                    La contraseña es requerida
                    </mat-error>
                    <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
                    Mínimo 6 caracteres
                    </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                    <mat-label>Rol</mat-label>
                    <mat-select formControlName="rol" required>
                    <mat-option value="empleado">Empleado</mat-option>
                    <mat-option value="ADMIN">Administrador</mat-option>
                    </mat-select>
                    <mat-error *ngIf="userForm.get('rol')?.hasError('required')">
                    El rol es requerido
                    </mat-error>
                </mat-form-field>
                </div>

                <div class="form-row">
                <mat-slide-toggle formControlName="activo">
                    Usuario Activo
                </mat-slide-toggle>
                </div>

                <div class="stepper-buttons">
                <button mat-raised-button color="primary" matStepperNext 
                        [disabled]="userForm.invalid">
                    Siguiente
                </button>
                </div>
            </form>
            </mat-step>

            <!-- Paso 2: Datos Personales -->
            <mat-step [stepControl]="personalForm" label="Datos Personales">
            <form [formGroup]="personalForm" class="form-section">
                
                <div class="form-row">
                <mat-form-field appearance="outline">
                    <mat-label>Cédula</mat-label>
                    <input matInput formControlName="cedula" required>
                    <mat-error *ngIf="personalForm.get('cedula')?.hasError('required')">
                    La cédula es requerida
                    </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                    <mat-label>Nombres</mat-label>
                    <input matInput formControlName="nombre" required>
                    <mat-error *ngIf="personalForm.get('nombre')?.hasError('required')">
                    Los nombres son requeridos
                    </mat-error>
                </mat-form-field>
                </div>

                <div class="form-row">
                <mat-form-field appearance="outline">
                    <mat-label>Apellidos</mat-label>
                    <input matInput formControlName="apellidos" required>
                    <mat-error *ngIf="personalForm.get('apellidos')?.hasError('required')">
                    Los apellidos son requeridos
                    </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                    <mat-label>Correo Personal</mat-label>
                    <input matInput type="email" formControlName="correo">
                </mat-form-field>
                </div>

                <div class="form-row">
                <mat-form-field appearance="outline">
                    <mat-label>Teléfono</mat-label>
                    <input matInput formControlName="telefono">
                </mat-form-field>

                <mat-form-field appearance="outline">
                    <mat-label>Género</mat-label>
                    <mat-select formControlName="generoId">
                    <mat-option value="">Seleccionar...</mat-option>
                    <mat-option *ngFor="let genero of generos" [value]="genero.id">
                        {{ genero.nombre }}
                    </mat-option>
                    </mat-select>
                </mat-form-field>
                </div>

                <div class="form-row">
                <mat-form-field appearance="outline">
                    <mat-label>Estado Civil</mat-label>
                    <mat-select formControlName="estadoCivilId">
                    <mat-option value="">Seleccionar...</mat-option>
                    <mat-option *ngFor="let estado of estadosCiviles" [value]="estado.id">
                        {{ estado.nombre }}
                    </mat-option>
                    </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                    <mat-label>Nacionalidad</mat-label>
                    <mat-select formControlName="nacionalidadId">
                    <mat-option value="">Seleccionar...</mat-option>
                    <mat-option *ngFor="let nacionalidad of nacionalidades" [value]="nacionalidad.id">
                        {{ nacionalidad.nombre }}
                    </mat-option>
                    </mat-select>
                    <mat-hint>Busca tu nacionalidad o elige "Otra" para especificar</mat-hint>
                </mat-form-field>
                </div>

                <!-- Campo para nacionalidad personalizada -->
                <div class="form-row" *ngIf="personalForm.get('nacionalidadId')?.value === 999">
                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Especificar Nacionalidad</mat-label>
                    <input matInput formControlName="nacionalidadPersonalizada" 
                        placeholder="Escriba su nacionalidad" required>
                    <mat-error *ngIf="personalForm.get('nacionalidadPersonalizada')?.hasError('required')">
                    Por favor especifique su nacionalidad
                    </mat-error>
                </mat-form-field>
                </div>

                <div class="form-row">
                <mat-form-field appearance="outline">
                    <mat-label>Fecha de Nacimiento</mat-label>
                    <input matInput [matDatepicker]="picker" formControlName="fechaNacimiento">
                    <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Dirección</mat-label>
                    <textarea matInput formControlName="direccion" rows="2"></textarea>
                </mat-form-field>
                </div>

                <div class="stepper-buttons">
                <button mat-button matStepperPrevious>Anterior</button>
                <button mat-raised-button color="primary" matStepperNext 
                        [disabled]="personalForm.invalid">
                    Siguiente
                </button>
                </div>
            </form>
            </mat-step>

            <!-- Paso 3: Datos Laborales -->
            <mat-step [stepControl]="workForm" label="Datos Laborales">
            <form [formGroup]="workForm" class="form-section">
                
                <div class="form-row">
                <mat-form-field appearance="outline">
                    <mat-label>Departamento</mat-label>
                    <mat-select formControlName="departamentoId" (selectionChange)="onDepartamentoChange($event.value)">
                    <mat-option value="">Seleccionar...</mat-option>
                    <mat-option *ngFor="let depto of departamentos" [value]="depto.id">
                        {{ depto.nombre }}
                    </mat-option>
                    </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                    <mat-label>Puesto</mat-label>
                    <mat-select formControlName="puestoId" [disabled]="!workForm.get('departamentoId')?.value">
                    <mat-option value="">Seleccionar...</mat-option>
                    <mat-option *ngFor="let puesto of puestosFiltrados" [value]="puesto.id">
                        {{ puesto.nombre }}
                    </mat-option>
                    </mat-select>
                </mat-form-field>
                </div>

                <div class="form-row">
                <mat-form-field appearance="outline">
                    <mat-label>Fecha de Ingreso</mat-label>
                    <input matInput [matDatepicker]="pickerIngreso" formControlName="fechaIngreso" required>
                    <mat-datepicker-toggle matIconSuffix [for]="pickerIngreso"></mat-datepicker-toggle>
                    <mat-datepicker #pickerIngreso></mat-datepicker>
                    <mat-error *ngIf="workForm.get('fechaIngreso')?.hasError('required')">
                    La fecha de ingreso es requerida
                    </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                    <mat-label>Salario Base</mat-label>
                    <input matInput type="number" formControlName="salarioBase" min="0" step="0.01">
                </mat-form-field>
                </div>

                <div class="stepper-buttons">
                <button mat-button matStepperPrevious>Anterior</button>
                <button mat-raised-button color="primary" 
                        [disabled]="workForm.invalid"
                        (click)="onSubmit()">
                    {{ data.isEdit ? 'Actualizar' : 'Crear' }} Usuario
                </button>
                </div>
            </form>
            </mat-step>

        </mat-stepper>

        <div *ngIf="loading" class="loading-container">
            <mat-spinner></mat-spinner>
            <p>{{ data.isEdit ? 'Actualizando' : 'Creando' }} usuario...</p>
        </div>

        </mat-dialog-content>
    `,
    styles: [`
        .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px 8px;
        border-bottom: 1px solid #e0e0e0;
        }

        .dialog-content {
        padding: 20px;
        max-height: 70vh;
        overflow-y: auto;
        }

        .form-section {
        padding: 20px 0;
        }

        .form-row {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
        }

        .form-row mat-form-field {
        flex: 1;
        }

        .full-width {
        width: 100%;
        }

        .stepper-buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        }

        .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px;
        }

        .loading-container mat-spinner {
        margin-bottom: 16px;
        }

        ::ng-deep .mat-stepper-horizontal {
        margin-top: 8px;
        }

        ::ng-deep .mat-form-field-appearance-outline .mat-form-field-outline {
        color: rgba(0,0,0,.12);
        }
    `]
    })
    export class UsuarioDialogComponent implements OnInit, OnDestroy {
    userForm!: FormGroup;
    personalForm!: FormGroup;
    workForm!: FormGroup;
    loading = false;
    
    // Datos para los selects
    generos: Genero[] = [];
    estadosCiviles: EstadoCivil[] = [];
    nacionalidades: Nacionalidad[] = [];
    departamentos: Departamento[] = [];
    puestos: Puesto[] = [];
    puestosFiltrados: Puesto[] = [];

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private usuariosService: UsuariosService,
        private usuariosMockService: UsuariosMockService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<UsuarioDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.createForms();
    }

    ngOnInit(): void {
        this.loadReferenceData();
        if (this.data.isEdit && this.data.usuario) {
        this.populateFormsForEdit();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    createForms(): void {
        this.userForm = this.fb.group({
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', this.data.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
        rol: ['empleado', Validators.required],
        activo: [true]
        });

        this.personalForm = this.fb.group({
        cedula: ['', Validators.required],
        nombre: ['', Validators.required],
        apellidos: ['', Validators.required],
        correo: ['', Validators.email],
        telefono: [''],
        direccion: [''],
        fechaNacimiento: [''],
        generoId: [''],
        estadoCivilId: [''],
        nacionalidadId: [''],
        nacionalidadPersonalizada: [''] // Campo para nacionalidad personalizada
        });

        // Agregar validación condicional para nacionalidad personalizada
        this.personalForm.get('nacionalidadId')?.valueChanges.subscribe(value => {
        const nacionalidadPersonalizadaControl = this.personalForm.get('nacionalidadPersonalizada');
        if (value === 999) { // Si selecciona "Otra"
            nacionalidadPersonalizadaControl?.setValidators([Validators.required]);
        } else {
            nacionalidadPersonalizadaControl?.clearValidators();
        }
        nacionalidadPersonalizadaControl?.updateValueAndValidity();
        });

        this.workForm = this.fb.group({
        departamentoId: [''],
        puestoId: [''],
        fechaIngreso: [new Date(), Validators.required],
        salarioBase: ['']
        // Removido supervisorId
        });
    }

    loadReferenceData(): void {
        forkJoin({
        generos: this.usuariosMockService.getGeneros(),
        estadosCiviles: this.usuariosMockService.getEstadosCiviles(),
        nacionalidades: this.usuariosMockService.getNacionalidades(),
        departamentos: this.usuariosMockService.getDepartamentos(),
        puestos: this.usuariosMockService.getPuestos()
        }).pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (data) => {
            this.generos = data.generos;
            this.estadosCiviles = data.estadosCiviles;
            this.nacionalidades = data.nacionalidades;
            this.departamentos = data.departamentos;
            this.puestos = data.puestos;
            },
            error: (error: any) => {
            console.error('Error al cargar datos de referencia:', error);
            this.snackBar.open('Error al cargar datos de referencia', 'Cerrar', {
                duration: 3000,
                panelClass: ['error-snackbar']
            });
            }
        });
    }

    populateFormsForEdit(): void {
        const usuario = this.data.usuario!;
        
        this.userForm.patchValue({
        username: usuario.username,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo
        });

        this.personalForm.patchValue({
        cedula: usuario.cedula,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        fechaNacimiento: usuario.fechaNacimiento ? new Date(usuario.fechaNacimiento) : null,
        generoId: usuario.generoId,
        estadoCivilId: usuario.estadoCivilId,
        nacionalidadId: usuario.nacionalidadId
        });

        // Si hay nacionalidad personalizada, setearla
        if (usuario.nacionalidadPersonalizada) {
        this.personalForm.patchValue({
            nacionalidadPersonalizada: usuario.nacionalidadPersonalizada
        });
        }

        this.workForm.patchValue({
        departamentoId: usuario.departamentoId,
        puestoId: usuario.puestoId,
        fechaIngreso: usuario.fechaIngreso ? new Date(usuario.fechaIngreso) : new Date(),
        salarioBase: usuario.salarioBase
        // Removido supervisorId
        });

        if (usuario.departamentoId) {
        this.onDepartamentoChange(usuario.departamentoId);
        }
    }

    onDepartamentoChange(departamentoId: number): void {
        if (departamentoId) {
        this.puestosFiltrados = this.puestos.filter(p => p.departamentoId === departamentoId);
        } else {
        this.puestosFiltrados = [];
        }
        
        // Reset puesto selection if no longer valid
        const currentPuesto = this.workForm.get('puestoId')?.value;
        if (currentPuesto && !this.puestosFiltrados.find(p => p.id === currentPuesto)) {
        this.workForm.get('puestoId')?.setValue('');
        }
    }

    onSubmit(): void {
        if (this.userForm.invalid || this.personalForm.invalid || this.workForm.invalid) {
            this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', {
                duration: 3000,
                panelClass: ['warning-snackbar']
            });
            return;
        }

        this.loading = true;

        // Construir objeto empleado
        const puestoSeleccionado = this.puestosFiltrados.find(p => p.id == this.workForm.value.puestoId);
        const empleado = {
            id: this.personalForm.value.cedula,
            username: this.userForm.value.username,
            nombre: this.personalForm.value.nombre,
            apellidos: this.personalForm.value.apellidos,
            correo: this.personalForm.value.correo,
            telefono: this.personalForm.value.telefono,
            direccion: this.personalForm.value.direccion,
            fechaNacimiento: this.personalForm.value.fechaNacimiento?.toISOString?.()?.split('T')[0],
            generoId: this.personalForm.value.generoId,
            estadoCivilId: this.personalForm.value.estadoCivilId,
            nacionalidadId: this.personalForm.value.nacionalidadId,
            nacionalidadPersonalizada: this.personalForm.value.nacionalidadPersonalizada,
            departamentoId: this.workForm.value.departamentoId,
            puestoId: this.workForm.value.puestoId,
            puesto: puestoSeleccionado?.nombre || 'Sin asignar', // ✅ AGREGADO: campo puesto requerido por backend
            fecha_ingreso: this.workForm.value.fechaIngreso?.toISOString?.()?.split('T')[0],
            salarioBase: this.workForm.value.salarioBase
        };

        // Construir objeto usuario
        const usuario = {
            id: this.data.isEdit ? this.data.usuario?.id : undefined,
            username: this.userForm.value.username,
            password: this.userForm.value.password || (this.data.isEdit ? 'admin123' : this.userForm.value.password), // ✅ Usar password válida (min 6 chars) en edición
            rol: this.userForm.value.rol,
            cedula: this.personalForm.value.cedula,
            email: this.userForm.value.email,
            activo: this.userForm.value.activo
        };

        if (this.data.isEdit) {
            // MODO EDICIÓN: Actualizar usuario existente
            const usuarioCompleto = {
                ...usuario,
                ...empleado
            };

            this.usuariosService.updateUsuario(usuario.id!, usuarioCompleto)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.loading = false;
                        this.snackBar.open('Usuario actualizado exitosamente', 'Cerrar', {
                            duration: 3000,
                            panelClass: ['success-snackbar']
                        });
                        this.dialogRef.close(true);
                    },
                    error: (error: any) => {
                        this.loading = false;
                        console.error('Error al actualizar usuario:', error);
                        this.snackBar.open(
                            error.status === 403 ? 'No tiene permisos para actualizar usuarios' : 'Error al actualizar usuario', 
                            'Cerrar', {
                            duration: 3000,
                            panelClass: ['error-snackbar']
                        });
                    }
                });
        } else {
            // MODO CREACIÓN: Crear nuevo usuario
            const registroCompleto = { usuario, empleado };

            this.usuariosService.registerCompleto(registroCompleto)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.loading = false;
                        this.snackBar.open('Usuario creado exitosamente', 'Cerrar', {
                            duration: 3000,
                            panelClass: ['success-snackbar']
                        });
                        this.dialogRef.close(true);
                    },
                    error: (error: any) => {
                        this.loading = false;
                        console.error('❌ [Usuario-Dialog] Error completo al crear usuario:');
                        console.error('   Status:', error.status);
                        console.error('   StatusText:', error.statusText);
                        console.error('   URL:', error.url);
                        console.error('   Error body:', error.error);
                        console.error('   Error object:', error);
                        
                        // Mostrar mensaje específico del backend si existe
                        let errorMessage = 'Error al crear usuario';
                        if (error.status === 403) {
                            errorMessage = 'No tiene permisos para crear usuarios';
                        } else if (error.error && error.error.message) {
                            errorMessage = `Error del servidor: ${error.error.message}`;
                        } else if (error.status === 500) {
                            errorMessage = 'Error interno del servidor. Revise la consola para más detalles.';
                        }
                        
                        console.error('   Mensaje mostrado al usuario:', errorMessage);
                        
                        this.snackBar.open(errorMessage, 'Cerrar', {
                            duration: 5000, // Más tiempo para leer el error
                            panelClass: ['error-snackbar']
                        });
                    }
                });
        }
    }
    }
