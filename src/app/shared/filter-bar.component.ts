import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports:[MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule],
  template: `
  <div class="filterbar">
    <mat-form-field appearance="outline">
      <mat-label>Buscar</mat-label>
      <input matInput [(ngModel)]="query" (keyup)="queryChange.emit(query)" placeholder="ID, nombre, estado…">
    </mat-form-field>
    <ng-content></ng-content>
    <span class="spacer"></span>
    <button mat-stroked-button (click)="clear()"><mat-icon>filter_alt_off</mat-icon> Limpiar</button>
  </div>`,
  styles:[`
    .filterbar{display:flex; gap:12px; align-items:center; flex-wrap:wrap}
    .spacer{flex:1}
  `]
})
export class FilterBarComponent {
  @Input() query = '';
  @Output() queryChange = new EventEmitter<string>();
  clear(){ this.query=''; this.queryChange.emit(this.query); }
}
