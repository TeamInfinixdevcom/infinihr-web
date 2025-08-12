import { Component, Input, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- AÑADIR ESTO
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

    @Component({
    selector: 'app-data-table',
    standalone: true,
    imports: [
        CommonModule,              // <-- AÑADIR ESTO
        MatTableModule, MatPaginatorModule, MatSortModule
    ],
    template: `
        <table mat-table [dataSource]="ds" matSort class="mat-elevation-z1">
        <ng-container *ngFor="let c of columns" [matColumnDef]="c.key">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ c.label }}</th>
            <td mat-cell *matCellDef="let row">
            <ng-container *ngIf="!c.cell; else custom">{{ row[c.key] }}</ng-container>
            <ng-template #custom>
                <ng-container *ngTemplateOutlet="c.cell; context:{ $implicit: row }"></ng-container>
            </ng-template>
            </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayed"></tr>
        <tr mat-row *matRowDef="let row; columns: displayed;"></tr>
        </table>
        <mat-paginator [pageSize]="10" [pageSizeOptions]="[5,10,25]"></mat-paginator>
    `
    })
    export class DataTableComponent<T> implements AfterViewInit {
    @Input() set data(v:T[]){ this.ds.data = v ?? []; }
    @Input() columns: { key: string; label: string; cell?: any }[] = [];
    displayed: string[] = [];
    ds = new MatTableDataSource<T>([]);
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    ngAfterViewInit(){ this.ds.paginator = this.paginator; this.ds.sort = this.sort; this.displayed = this.columns.map(c=>c.key); }
    }
