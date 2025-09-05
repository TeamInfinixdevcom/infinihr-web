import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Empleado {
  id: number;
  nombre: string;
  correo: string;
  puesto: string;
  fecha_ingreso: string; // Cambio para coincidir con el backend
  username?: string; // Campo opcional ya que no viene en la respuesta del backend
}

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {
  private apiUrl = '/api/empleados';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Empleado[]> {
    console.log('📋 Obteniendo empleados de:', this.apiUrl);
    
    return this.http.get<Empleado[]>(this.apiUrl).pipe(
      tap(empleados => {
        console.log('✅ Empleados obtenidos:', empleados);
      }),
      catchError(error => {
        console.error('❌ Error al obtener empleados:', error);
        // Devolver datos de respaldo si falla la API
        return of([
          { id: 3, nombre: 'Administrador del Sistema', correo: 'admin@infinihr.com', puesto: 'Administrador', fecha_ingreso: '2025-01-01', username: 'admin' },
          { id: 4, nombre: 'Juan Pérez', correo: 'juan.perez@infinihr.com', puesto: 'Desarrollador', fecha_ingreso: '2025-01-15', username: 'empleado' },
          { id: 1, nombre: 'Juan Pérez', correo: 'juan@infinihr.com', puesto: 'Desarrollador', fecha_ingreso: '2025-07-30', username: 'usuario_1' },
          { id: 2, nombre: 'Ana Mora', correo: 'ana.mora@empresa.com', puesto: 'Desarrollador Junior', fecha_ingreso: '', username: 'usuario_2' }
        ]);
      })
    );
  }

  getById(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.apiUrl}/${id}`);
  }
}
