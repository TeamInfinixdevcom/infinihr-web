import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { BaseCrudService } from '../shared/base-crud.service';
import { AuthService } from './auth/auth.service';

export interface Vacacion {
  id: number;
  empleadoId: string;  // Cambiar a string para manejar cédulas
  fechaInicio: string;
  fechaFin: string;
  fechaAprobacion?: string | null;
  dias: number | null;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
  motivo: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class VacacionesService extends BaseCrudService<Vacacion> {
  private apiUrl = `${environment.apiUrl}/vacaciones`;

  constructor(protected override http: HttpClient, private authService: AuthService) {
    super(http, `${environment.apiUrl}/vacaciones`);
  }

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
  override list(): Observable<Vacacion[]> {
    return this.getVacaciones();
  }

  getVacacionesEmpleado(): Observable<Vacacion[]> {
    // Llamada al endpoint que usa la autenticación (server obtiene el username del token)
    const url = `${this.apiUrl}/empleado`;
    console.log('Solicitando vacaciones del empleado autenticado a:', url);
    return this.http.get<Vacacion[]>(url).pipe(
      tap(v => {
        console.log('Vacaciones recibidas (empleado):', v);
        
        // VERIFICAR SI EL BACKEND ENVÍA fechaAprobacion
        console.log('🔍 VERIFICACIÓN BACKEND:');
        v.forEach((vacacion, index) => {
          console.log(`📋 Vacación ${vacacion.id}:`, {
            estado: vacacion.estado,
            fechaAprobacion: vacacion.fechaAprobacion,
            type: typeof vacacion.fechaAprobacion,
            isNull: vacacion.fechaAprobacion === null,
            isUndefined: vacacion.fechaAprobacion === undefined,
            keys: Object.keys(vacacion)
          });
        });
      }),
      catchError(error => {
        console.error('Error en getVacacionesEmpleado:', error);
        return throwError(() => new Error('Error al obtener las vacaciones del empleado.'));
      })
    );
  }

  // Obtener vacaciones del empleado actual
  getVacacionesEmpleadoActual(): Observable<Vacacion[]> {
    // Preferir el endpoint auth-based en el backend: GET /api/vacaciones/empleado
    // Si por alguna razón no hay sesión completa, devolvemos [] en el frontend
    const cedula = this.authService.getEmpleadoCedula();
    if (!cedula) {
      console.warn('getVacacionesEmpleadoActual: no hay cédula en AuthService, devolviendo []');
      return of([]);
    }
    const url = `${this.apiUrl}/empleado`;
    console.log('getVacacionesEmpleadoActual -> llamando a:', url, 'para cedula (local):', cedula);
    return this.http.get<Vacacion[]>(url).pipe(
      tap(v => console.log('Vacaciones obtenidas para empleado actual:', v)),
      catchError(err => {
        console.error('Error en getVacacionesEmpleadoActual:', err);
        return of([]);
      })
    );
  }

  // Crear solicitud de vacación (automáticamente asignada al empleado actual)
  createVacacionEmpleado(vacacion: Partial<Vacacion>): Observable<Vacacion> {
    const empleadoCedula = this.authService.getEmpleadoCedula();
    
    if (empleadoCedula) {
      // Si hay una cédula de empleado, asignar automáticamente
      const vacacionData: Partial<Vacacion> = {
        ...vacacion,
        empleadoId: empleadoCedula  // Ahora es string, no hay conflicto de tipos
      };
      console.log('📋 Datos de vacación para empleado:', vacacionData);
      return this.create(vacacionData);
    } else {
      // Si no hay cédula, mostrar error
      console.error('❌ No se pudo identificar la cédula del empleado');
      return throwError(() => new Error('No se pudo identificar el empleado'));
    }
  }

  override create(data: Partial<Vacacion>): Observable<Vacacion> {
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

  override update(id: number, data: Partial<Vacacion>): Observable<Vacacion> {
    return this.http.put<Vacacion>(`${this.apiUrl}/${id}`, data).pipe(
      catchError(error => {
        console.error('❌ Error al actualizar vacación:', error);
        return throwError(() => error);
      })
    );
  }

  override delete(id: number): Observable<any> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('❌ Error al eliminar vacación:', error);
        return throwError(() => error);
      })
    );
  }

  getVacacionesPorCedula(cedula: string): Observable<Vacacion[]> {
  // Endpoint backend: GET /vacaciones/empleado/{cedula}
  return this.http.get<Vacacion[]>(`${this.apiUrl}/empleado/${cedula}`);
  }
}