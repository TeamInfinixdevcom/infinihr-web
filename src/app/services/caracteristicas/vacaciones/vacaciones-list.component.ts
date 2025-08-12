import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { VacacionesService, Vacacion } from '../../vacaciones.service';

// Angular Material
import { MatToolbarModule }    from '@angular/material/toolbar';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';
import { MatCardModule }       from '@angular/material/card';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatSelectModule }     from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule }    from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Dialog (crear/editar)
import { VacacionesDialogComponent } from './vacaciones-dialog.component';
export type VacacionForm = {
  id?: number;
  empleadoId: number;
  fechaInicio: string | Date;
  fechaFin: string | Date;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
};

@Component({
  selector: 'app-vacaciones-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatTooltipModule, MatSnackBarModule, MatDialogModule
  ],
  templateUrl: './vacaciones-list.component.html',
  styleUrls: ['./vacaciones-list.component.scss']
})
export class VacacionesListComponent implements OnInit {

  // UI
  loading = true;
  error?: string;

  // Tabla
  cols: string[] = ['id','empleadoId','fechaInicio','fechaFin','estado','acciones'];
  dataSource = new MatTableDataSource<Vacacion>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filtros
  filters = {
    texto: '',
    estado: '',
    desde: undefined as Date | undefined,
    hasta: undefined as Date | undefined
  };

  constructor(
    private api: VacacionesService,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  // Cargar datos
  refresh(): void {
    this.loading = true;
    this.api.list().subscribe({
      next: (d: Vacacion[]) => {
        this.dataSource = new MatTableDataSource<Vacacion>(d ?? []);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        // Filtro compuesto
        this.dataSource.filterPredicate = (row: Vacacion, json: string) => {
          const f = JSON.parse(json);
          const txt = `${row.id} ${row.empleadoId} ${row.estado}`.toLowerCase();
          const byTxt = !f.texto || txt.includes(f.texto);
          const byEstado = !f.estado || row.estado === f.estado;
          const byDesde = !f.desde || new Date(row.fechaInicio) >= new Date(f.desde);
          const byHasta = !f.hasta || new Date(row.fechaFin) <= new Date(f.hasta);
          return byTxt && byEstado && byDesde && byHasta;
        };

        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las vacaciones';
        this.loading = false;
      }
    });
  }

  // Filtros / búsqueda
  applySearch(ev: Event): void {
    const val = (ev.target as HTMLInputElement).value.trim().toLowerCase();
    this.filters.texto = val;
    this.applyFilters();
  }

  applyFilters(): void {
    this.dataSource.filter = JSON.stringify({
      texto: this.filters.texto,
      estado: this.filters.estado,
      desde: this.filters.desde,
      hasta: this.filters.hasta
    });
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  clearFilters(): void {
    this.filters = { texto: '', estado: '', desde: undefined, hasta: undefined };
    this.applyFilters();
  }

  // CRUD
  openCreate(): void {
    const ref = this.dialog.open(VacacionesDialogComponent, { width: '560px', data: null });
    ref.afterClosed().subscribe((val: VacacionForm | undefined) => {
      if (!val) return;
      this.api.create(val as any).subscribe({
        next: () => { this.snack.open('Solicitud creada', 'Ok', { duration: 1500 }); this.refresh(); },
        error: () => this.snack.open('Error creando solicitud', 'Ok', { duration: 2000 })
      });
    });
  }

  openEdit(v: Vacacion): void {
    const ref = this.dialog.open(VacacionesDialogComponent, { width: '560px', data: v });
    ref.afterClosed().subscribe((val: VacacionForm | undefined) => {
      if (!val) return;
      this.api.update(v.id, val as any).subscribe({
        next: () => { this.snack.open('Solicitud actualizada', 'Ok', { duration: 1500 }); this.refresh(); },
        error: () => this.snack.open('Error actualizando solicitud', 'Ok', { duration: 2000 })
      });
    });
  }

  confirmDelete(v: Vacacion): void {
    if (!confirm(`Eliminar solicitud #${v.id}?`)) return;
    this.api.delete(v.id).subscribe({
      next: () => { this.snack.open('Solicitud eliminada', 'Ok', { duration: 1500 }); this.refresh(); },
      error: () => this.snack.open('Error eliminando solicitud', 'Ok', { duration: 2000 })
    });
  }
}
