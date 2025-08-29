import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Vacacion {
  id: number;
  empleadoId: number;  // Cambiar a camelCase
  fechaInicio: string;
  fechaFin: string;
  dias: number | null;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
  motivo: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class VacacionesService {
  private apiUrl = `${environment.apiUrl}/vacaciones`;

  constructor(private http: HttpClient) { }

  getVacaciones(): Observable<Vacacion[]> {
    console.log('🔍 Obteniendo vacaciones de:', this.apiUrl);
    
    return this.http.get<Vacacion[]>(this.apiUrl).pipe(
      tap(vacaciones => {
        console.log('✅ Vacaciones obtenidas del servidor:', vacaciones);
      }),
      catchError(error => {
        console.error('❌ Error al obtener vacaciones del servidor:', error);
        return throwError(() => error);
      })
    );
  }

  // Alias para compatibilidad
  list(): Observable<Vacacion[]> {
    return this.getVacaciones();
  }

  getVacacionesEmpleado(): Observable<Vacacion[]> {
    const url = `${this.apiUrl}/empleado`;
    console.log('Solicitando vacaciones de empleado a:', url);
    return this.http.get<Vacacion[]>(url).pipe(
      catchError(error => {
        console.error('Error en getVacacionesEmpleado:', error);
        return throwError(() => new Error('Error al obtener las vacaciones del empleado.'));
      })
    );
  }

  create(data: Partial<Vacacion>): Observable<Vacacion> {
    console.log('🔄 Creando nueva solicitud de vacaciones...');
    console.log('📝 Datos enviados:', data);
    console.log('🌐 URL destino:', this.apiUrl);
    
    return this.http.post<Vacacion>(this.apiUrl, data).pipe(
      tap(response => {
        console.log('✅ Solicitud creada exitosamente:', response);
      }),
      catchError(error => {
        console.error('❌ Error al crear vacación:', error);
        console.error('📋 Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        return throwError(() => error);
      })
    );
  }

  update(id: number, data: Partial<Vacacion>): Observable<Vacacion> {
    return this.http.put<Vacacion>(`${this.apiUrl}/${id}`, data).pipe(
      catchError(error => {
        console.error('❌ Error al actualizar vacación:', error);
        return throwError(() => error);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('❌ Error al eliminar vacación:', error);
        return throwError(() => error);
      })
    );
  }
}