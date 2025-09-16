import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';

export interface Usuario {
  id?: number;
  username: string;
  password?: string;
  email: string;
  rol: 'ADMIN' | 'empleado';
  activo: boolean;
  // Datos del empleado vinculado
  empleadoCedula?: string;
  empleadoNombre?: string;
  empleadoApellidos?: string;
  empleadoCorreo?: string;
  empleadoPuesto?: string;
  empleadoTelefono?: string;
  empleadoDireccion?: string;
  empleadoFechaNacimiento?: string;
  empleadoFechaIngreso?: string;
  empleadoSalarioBase?: number;
  // IDs de tablas relacionales
  generoId?: number;
  estadoCivilId?: number;
  nacionalidadId?: number;
  departamentoId?: number;
  puestoId?: number;
  supervisorId?: string;
  // Nombres de las relaciones (para mostrar)
  generoNombre?: string;
  estadoCivilNombre?: string;
  nacionalidadNombre?: string;
  departamentoNombre?: string;
  puestoNombre?: string;
  supervisorNombre?: string;
}

export interface UsuarioCompleto {
  id?: number;
  // Datos del usuario
  username: string;
  password?: string;
  email: string;
  rol: 'ADMIN' | 'empleado';
  activo?: boolean;
  
  // Datos del empleado
  cedula: string;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  fechaIngreso: string;
  salarioBase?: number;
  
  // IDs relacionales
  generoId?: number;
  estadoCivilId?: number;
  nacionalidadId?: number;
  nacionalidadPersonalizada?: string; // Para cuando se elige "Otra"
  departamentoId?: number;
  puestoId?: number;

  // Objetos relacionales (para mostrar)
  genero?: Genero;
  estado_civil?: EstadoCivil;
  nacionalidad?: Nacionalidad;
  departamento?: Departamento;
  puesto?: Puesto;
}

export interface Genero {
  id: number;
  nombre: string;
}

export interface EstadoCivil {
  id: number;
  nombre: string;
}

export interface Nacionalidad {
  id: number;
  nombre: string;
}

export interface Departamento {
  id: number;
  nombre: string;
  descripcion: string;
  padreId?: number;
}

export interface Puesto {
  id: number;
  nombre: string;
  descripcion: string;
  departamentoId: number;
  salarioBase: number;
  nivel: string;
}

export interface EmpleadoSupervisor {
  id: string;
  nombre: string;
  apellidos: string;
  puesto: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = '/api/usuarios';
  private empleadosUrl = '/api/empleados';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const rawToken = localStorage.getItem('token');
    const userRole = localStorage.getItem('rol');
    console.log('🔑 [UsuariosService] Token crudo en localStorage:', rawToken ? `${rawToken.substring(0, 20)}...` : 'NULL');
    console.log('👤 [UsuariosService] Rol en localStorage:', userRole);
    
    // Usar directamente localStorage en lugar de AuthService para evitar problemas
    if (!rawToken) {
      console.warn('⚠️ No hay token disponible en UsuariosService');
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
    }

    // Asegurar formato Bearer correcto
    const bearerToken = rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`;
    console.log('🔧 [UsuariosService] Token con Bearer:', `${bearerToken.substring(0, 30)}...`);

    // Crear headers base
    const headers: any = {
      'Authorization': bearerToken,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Agregar rol si existe
    if (userRole) {
      headers['X-User-Role'] = userRole;
      console.log('🔐 [UsuariosService] Agregando X-User-Role:', userRole);
    }

    console.log('📤 [UsuariosService] Headers finales:', Object.keys(headers));
    return new HttpHeaders(headers);
  }  /**
   * Obtener todos los usuarios con sus empleados vinculados
   */
  getUsuarios(): Observable<Usuario[]> {
    console.log('📡 [UsuariosService] Solicitando usuarios al servidor...');
    
    // Verificar token antes de hacer la petición
    const rawToken = localStorage.getItem('token');
    console.log('🔑 [UsuariosService] Token crudo en localStorage:', rawToken ? `${rawToken.substring(0, 20)}...` : 'NULL');
    
    const headers = this.getHeaders();
    console.log('🔧 [UsuariosService] Headers configurados:', {
      'Content-Type': headers.get('Content-Type'),
      'Accept': headers.get('Accept'),
      'Authorization': headers.get('Authorization') ? `${headers.get('Authorization')?.substring(0, 30)}...` : 'NULL'
    });
    
    return this.http.get<Usuario[]>(`${this.apiUrl}`, {
      headers: headers,
      observe: 'response'
    }).pipe(
      tap(response => {
        console.log('📦 [UsuariosService] Respuesta exitosa del servidor:', {
          status: response.status,
          statusText: response.statusText,
          bodyLength: response.body?.length || 0
        });
      }),
      map(response => response.body || []),
      catchError(error => {
        console.error('❌ [UsuariosService] Error detallado:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message,
          responseBody: error.error,
          headers: error.headers ? {
            'Content-Type': error.headers.get('Content-Type'),
            'WWW-Authenticate': error.headers.get('WWW-Authenticate')
          } : 'No headers'
        });
        
        if (error.status === 403) {
          console.error('🚫 [UsuariosService] Análisis del 403:');
          console.error('   • URL solicitada:', error.url);
          console.error('   • Token enviado:', headers.get('Authorization') ? 'SÍ' : 'NO');
          console.error('   • Mensaje del servidor:', error.error);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener usuario por ID con datos completos
   */
  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}/completo`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Obtener todos los usuarios con datos completos
   */
  getUsuariosCompletos(): Observable<UsuarioCompleto[]> {
    return this.http.get<UsuarioCompleto[]>(`${this.apiUrl}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtener un usuario específico con datos completos
   */
  getUsuarioCompleto(id: number): Observable<UsuarioCompleto> {
    return this.http.get<UsuarioCompleto>(`${this.apiUrl}/${id}/completo`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Activar/Desactivar usuario
   */
  toggleUserStatus(id: number, activo: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/activo`, { activo }, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Crear usuario completo (usuario + empleado)
   */
  createUsuarioCompleto(usuario: UsuarioCompleto): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/completo`, usuario, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Actualizar usuario completo
   */
  updateUsuarioCompleto(id: number, usuario: Partial<UsuarioCompleto>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}/completo`, usuario, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Actualizar usuario (endpoint correcto del backend)
   */
  updateUsuario(id: number, usuarioData: any): Observable<Usuario> {
    console.log('🔄 [UsuariosService] Actualizando usuario con ID:', id);
    console.log('📝 [UsuariosService] Datos a enviar:', usuarioData);
    
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuarioData, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(response => console.log('✅ [UsuariosService] Usuario actualizado:', response)),
      catchError(error => {
        console.error('❌ [UsuariosService] Error al actualizar usuario:', error);
        throw error;
      })
    );
  }

  /**
   * Eliminar usuario (y opcionalmente empleado)
   */
  deleteUsuario(id: number, eliminarEmpleado: boolean = false): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders(),
      params: { eliminarEmpleado: eliminarEmpleado.toString() }
    });
  }

  /**
   * Activar/Desactivar usuario
   */
  toggleUsuarioActivo(id: number, activo: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/activo`, { activo }, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Cambiar contraseña
   */
  cambiarPassword(id: number, nuevaPassword: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/password`, { password: nuevaPassword }, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Verificar si username está disponible
   */
  verificarUsername(username: string, excludeId?: number): Observable<{ disponible: boolean }> {
    const params: any = { username };
    if (excludeId) {
      params.excludeId = excludeId.toString();
    }
    return this.http.get<{ disponible: boolean }>(`${this.apiUrl}/verificar-username`, {
      params,
      headers: this.getHeaders()
    });
  }

  /**
   * Verificar si cédula está disponible
   */
  verificarCedula(cedula: string, excludeId?: string): Observable<{ disponible: boolean }> {
    const params: any = { cedula };
    if (excludeId) {
      params.excludeId = excludeId;
    }
    return this.http.get<{ disponible: boolean }>(`${this.empleadosUrl}/verificar-cedula`, {
      params,
      headers: this.getHeaders()
    });
  }

  /**
   * Verificar si email está disponible
   */
  verificarEmail(email: string, excludeId?: number): Observable<{ disponible: boolean }> {
    const params: any = { email };
    if (excludeId) {
      params.excludeId = excludeId.toString();
    }
    return this.http.get<{ disponible: boolean }>(`${this.apiUrl}/verificar-email`, {
      params,
      headers: this.getHeaders()
    });
  }

  // Métodos para obtener datos de tablas relacionales
  getGeneros(): Observable<Genero[]> {
    return this.http.get<Genero[]>(`${this.apiUrl}/generos`, { headers: this.getHeaders() });
  }

  getEstadosCiviles(): Observable<EstadoCivil[]> {
    return this.http.get<EstadoCivil[]>(`${this.apiUrl}/estados-civiles`, { headers: this.getHeaders() });
  }

  getNacionalidades(): Observable<Nacionalidad[]> {
    return this.http.get<Nacionalidad[]>(`${this.apiUrl}/nacionalidades`, { headers: this.getHeaders() });
  }

  getDepartamentos(): Observable<Departamento[]> {
    // Backend exposes departamentos at /api/departamentos in the server
    return this.http.get<Departamento[]>(`/api/departamentos`, { headers: this.getHeaders() });
  }

  getPuestos(): Observable<Puesto[]> {
    // Backend exposes puestos at /api/puestos
    return this.http.get<Puesto[]>(`/api/puestos`, { headers: this.getHeaders() });
  }

  getPuestosPorDepartamento(departamentoId: number): Observable<Puesto[]> {
    // Common backend path for puestos by departamento
    return this.http.get<Puesto[]>(`/api/puestos/departamento/${departamentoId}`, { 
      headers: this.getHeaders() 
    });
  }

  getEmpleadosParaSupervisor(): Observable<EmpleadoSupervisor[]> {
    return this.http.get<EmpleadoSupervisor[]>(`${this.empleadosUrl}/supervisores`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Registro conjunto de usuario y empleado
   */
  registerCompleto(data: any): Observable<any> {
    console.log('🔄 [UsuariosService] Creando usuario con registerCompleto');
    console.log('📝 [UsuariosService] Datos originales:', JSON.stringify(data, null, 2));
    
    // Usar el endpoint correcto del backend: /register-completo
    // El backend espera el formato: { usuario: UsuarioDTO, empleado: EmpleadoDTO }
    const registroData = {
      usuario: data.usuario,
      empleado: data.empleado
    };
    
    console.log('📝 [UsuariosService] Datos para POST register-completo:', JSON.stringify(registroData, null, 2));
    console.log('🌐 [UsuariosService] URL:', `${this.apiUrl}/register-completo`);
    console.log('🔑 [UsuariosService] Headers:', this.getHeaders());
    
    return this.http.post(`${this.apiUrl}/register-completo`, registroData, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        console.log('✅ [UsuariosService] Usuario creado exitosamente:', response);
      }),
      catchError(error => {
        console.error('❌ [UsuariosService] Error completo al crear usuario:');
        console.error('   Status:', error.status);
        console.error('   StatusText:', error.statusText);
        console.error('   URL:', error.url);
        console.error('   Error body:', error.error);
        console.error('   Headers:', error.headers);
        console.error('   Error completo:', JSON.stringify(error, null, 2));
        
        // Intentar extraer mensaje específico del backend
        if (error.error && error.error.message) {
          console.error('   Mensaje del backend:', error.error.message);
        }
        
        throw error;
      })
    );
  }
}
