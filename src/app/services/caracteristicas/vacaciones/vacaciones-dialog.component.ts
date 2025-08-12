    import { Component, Inject } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import {
    FormBuilder,
    ReactiveFormsModule,
    Validators,
    AbstractControl,
    ValidationErrors,
    ValidatorFn,
    FormGroup,
    } from '@angular/forms';

    import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
    } from '@angular/material/dialog';
    import { MatFormFieldModule }  from '@angular/material/form-field';
    import { MatInputModule }      from '@angular/material/input';
    import { MatSelectModule }     from '@angular/material/select';
    import { MatDatepickerModule } from '@angular/material/datepicker';
    import { MatNativeDateModule } from '@angular/material/core';
    import { MatButtonModule }     from '@angular/material/button';

    export type VacacionForm = {
    id?: number;
    empleadoId: number;
    fechaInicio: string | Date;
    fechaFin: string | Date;
    estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
    };

    /* ---------- utils / validadores ---------- */
    const rangoFechasValido: ValidatorFn = (
    ctrl: AbstractControl
    ): ValidationErrors | null => {
    const g: any = ctrl;
    const ini = g.get?.('fechaInicio')?.value as Date | string | null;
    const fin = g.get?.('fechaFin')?.value as Date | string | null;
    if (!ini || !fin) return null;

    const d1 = typeof ini === 'string' ? new Date(ini) : ini;
    const d2 = typeof fin === 'string' ? new Date(fin) : fin;
    if (isNaN(d1?.getTime?.()) || isNaN(d2?.getTime?.())) return null;

    return d2 >= d1 ? null : { rangoFecha: true };
    };

    function toISO(d: string | Date | null | undefined): string | null {
    if (!d) return null;
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(date.getTime())) return null;
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${mm}-${dd}`; // yyyy-MM-dd
    }

    /* ================== COMPONENTE ================== */
    @Component({
    selector: 'app-vacaciones-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
    ],
    template: `
        <h2 mat-dialog-title>{{ data?.id ? 'Editar' : 'Nueva' }} solicitud de vacaciones</h2>

        <form [formGroup]="form" class="dialog-form" mat-dialog-content>
        <mat-form-field appearance="outline">
            <mat-label>Empleado ID</mat-label>
            <input matInput type="number" formControlName="empleadoId" required>
            <mat-error *ngIf="fc.empleadoId.touched && fc.empleadoId.hasError('required')">
            El empleado es obligatorio.
            </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
            <mat-label>Inicio</mat-label>
            <input matInput [matDatepicker]="dp1" formControlName="fechaInicio" required>
            <mat-datepicker-toggle matSuffix [for]="dp1"></mat-datepicker-toggle>
            <mat-datepicker #dp1></mat-datepicker>
            <mat-error *ngIf="fc.fechaInicio.touched && fc.fechaInicio.hasError('required')">
            La fecha de inicio es obligatoria.
            </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
            <mat-label>Fin</mat-label>
            <input matInput [matDatepicker]="dp2" formControlName="fechaFin" required>
            <mat-datepicker-toggle matSuffix [for]="dp2"></mat-datepicker-toggle>
            <mat-datepicker #dp2></mat-datepicker>
            <mat-error *ngIf="fc.fechaFin.touched && fc.fechaFin.hasError('required')">
            La fecha de fin es obligatoria.
            </mat-error>
            <mat-error *ngIf="form.touched && form.hasError('rangoFecha')">
            La fecha fin debe ser mayor o igual a la fecha inicio.
            </mat-error>
        </mat-form-field>
            <mat-form-field appearance="outline">
            <mat-label>Estado</mat-label>
            <mat-select formControlName="estado" required>
                <mat-option value="Pendiente">Pendiente</mat-option>
                <mat-option value="Aprobado">Aprobado</mat-option>
                <mat-option value="Rechazado">Rechazado</mat-option>
            </mat-select>
            <mat-error *ngIf="fc.estado.touched && fc.estado.hasError('required')">
                Seleccione un estado.
            </mat-error>
            </mat-form-field>


        <div mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">
            Guardar
        </button>
        </div>
    `,
    styles: [`
        .dialog-form {
        display: grid;
        gap: 12px;
        grid-template-columns: 1fr 1fr;
        padding-top: 4px;
        }
        @media (max-width: 800px) { .dialog-form { grid-template-columns: 1fr; } }
    `],
    })
    export class VacacionesDialogComponent {
    // Declaramos sin inicializar; se crea dentro del constructor
    form!: FormGroup;

    get fc() { return (this.form.controls as any); }

    constructor(
        private fb: FormBuilder,
        private ref: MatDialogRef<VacacionesDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Partial<VacacionForm> | null
    ) {
        // AHORA sí construimos el form (ya existen fb y data)
        this.form = this.fb.group(
        {
            id:          [this.data?.id ?? null],
            empleadoId:  [this.data?.empleadoId ?? null, [Validators.required]],
            fechaInicio: [this.data?.fechaInicio ?? null, [Validators.required]],
            fechaFin:    [this.data?.fechaFin ?? null, [Validators.required]],
            estado:      [this.data?.estado ?? 'Pendiente', [Validators.required]],
        },
        { validators: rangoFechasValido }
        );
    }

    save(): void {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }

        const v = this.form.value;
        const payload: VacacionForm = {
        id: v['id'] ?? undefined,
        empleadoId: Number(v['empleadoId']),
        fechaInicio: toISO(v['fechaInicio'])!,
        fechaFin: toISO(v['fechaFin'])!,
        estado: v['estado'] as VacacionForm['estado'],
        };

        this.ref.close(payload);
    }
    }
