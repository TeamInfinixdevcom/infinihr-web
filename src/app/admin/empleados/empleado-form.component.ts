import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadoDTO, EmpleadoService } from '../../services/empleado.service';

@Component({
  selector: 'app-empleado-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h3>{{empleado.id ? 'Editar' : 'Nuevo'}} Empleado</h3>
      <form #f="ngForm" (ngSubmit)="save()">
        <label>Cédula<br><input name="id" [(ngModel)]="empleado.id" required/></label><br>
        <label>Nombre<br><input name="nombre" [(ngModel)]="empleado.nombre"/></label><br>
        <label>Apellidos<br><input name="apellidos" [(ngModel)]="empleado.apellidos"/></label><br>
        <label>Username<br><input name="username" [(ngModel)]="empleado.username"/></label><br>
        <label>Correo<br><input name="correo" [(ngModel)]="empleado.correo"/></label><br>
        <label>Rol<br><input name="rol" [(ngModel)]="empleado.rol"/></label><br>
        <label>Activo
          <select name="activo" [(ngModel)]="empleado.activo">
            <option [ngValue]="true">Sí</option>
            <option [ngValue]="false">No</option>
          </select>
        </label><br>
        <button type="submit">Guardar</button>
      </form>
    </div>
  `
})
export class EmpleadoFormComponent implements OnInit {
  @Input() empleado: EmpleadoDTO = {};
  @Input() readOnly = false;
  @Output() saved = new EventEmitter<EmpleadoDTO>();

  constructor(private empleadoService: EmpleadoService) {}

  ngOnInit(): void {}

  save() {
    if (this.readOnly) return;
    if (this.empleado.id) {
      this.empleadoService.update(this.empleado.id, this.empleado).subscribe({
        next: v => { alert('Empleado actualizado'); this.saved.emit(v); },
        error: e => alert('Error al actualizar')
      });
    } else {
      this.empleadoService.create(this.empleado).subscribe({
        next: v => { alert('Empleado creado'); this.saved.emit(v); },
        error: e => alert('Error al crear')
      });
    }
  }
}
