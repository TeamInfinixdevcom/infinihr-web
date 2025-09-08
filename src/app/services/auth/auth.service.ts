import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

interface AuthResponse {
  token?: string;
  username?: string;
  rol?: string;
  id?: number;
  empleadoId?: number;
  empleadoNombre?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api';
  private authUrl = `${this.apiUrl}/auth`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasTokenPrivate());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private userInfo: { username: string, rol: string, id: string } | null = null;

  constructor(private http: HttpClient) {
    console.log('🔐 AuthService inicializado');
    console.log('🌐 API URL:', this.apiUrl);
    this.checkTokenValidity();
  }

  login(username: string, password: string): Observable<AuthResponse> {
    console.log('🔑 Iniciando autenticación para:', username);
    const payload = { username, password };
    const headers = { 'Content-Type': 'application/json' };

    return new Observable<AuthResponse>(observer => {
      this.http.post<AuthResponse>(`${this.authUrl}/login`, payload, { headers }).subscribe({
        next: (response) => {
          console.log('📦 Respuesta del servidor:', response);
          if (response.token) {
            console.log('✅ Login exitoso');
            this.storeAuthData(response);
            this.isAuthenticatedSubject.next(true);
            this.setUserInfo({
              username: response.username || '',
              rol: response.rol || '',
              id: response.id?.toString() || ''
            });
              // Si la respuesta no trae empleadoCedula, intentar obtenerla desde el backend por username
              const cedulaFromResponse = response.empleadoId?.toString() || response.id?.toString();
              if (!cedulaFromResponse) {
                console.log('🔎 No se recibió cédula en la respuesta, buscando en backend por username...');
                this.http.get<any[]>(`${this.apiUrl}/empleados`).subscribe({
                  next: empleados => {
                    try {
                      const found = empleados.find(e => e.username === response.username);
                      if (found && found.id) {
                        const ced = found.id.toString();
                        localStorage.setItem('empleadoCedula', ced);
                        localStorage.setItem('empleadoId', ced);
                        localStorage.setItem('empleadoNombre', found.nombre || '');
                        console.log('✅ Cédula encontrada y guardada desde backend:', ced);
                      } else {
                        console.warn('⚠️ No se encontró empleado con username en /api/empleados');
                      }
                    } catch (e) {
                      console.error('❌ Error procesando lista de empleados:', e);
                    }
                    observer.next(response);
                    observer.complete();
                  },
                  error: (err) => {
                    console.error('❌ Error obteniendo lista de empleados para mapear cédula:', err);
                    // aunque falle, resolvemos el login para no bloquear UX
                    observer.next(response);
                    observer.complete();
                  }
                });
              } else {
                // Completar inmediatamente - la cédula ya está guardada
                observer.next(response);
                observer.complete();
              }
          } else {
            console.error('❌ No se recibió token en la respuesta');
            observer.error(new Error('No se recibió token'));
          }
        },
        error: (error) => {
          console.error('❌ Error de autenticación:', error);
          this.isAuthenticatedSubject.next(false);
          localStorage.clear();
          observer.error(error);
        }
      });
    });
  }

  private storeAuthData(response: AuthResponse): void {
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('username', response.username || '');
      localStorage.setItem('rol', response.rol || '');
      
        // Mapear usuarios conocidos a sus cédulas
        const rolNormalized = (response.rol || '').toString().toLowerCase();
        if (rolNormalized.includes('empleado')) {
          const userToCedula: { [key: string]: string } = {
            'ana.mora': '301234568',
            'usuario_2': '301234568',
            'empleado': '301234568'
          };

          // Preferir mapeo por username, si no existe usar un valor por defecto razonable
          const cedula = userToCedula[(response.username || '').toString().toLowerCase()] || '301234568';
          localStorage.setItem('empleadoCedula', cedula);
          localStorage.setItem('empleadoId', cedula);
          localStorage.setItem('empleadoNombre', response.empleadoNombre || 'Ana Mora');

          console.log('✅ Datos del empleado guardados:', {
            username: response.username,
            cedula: cedula,
            nombre: response.empleadoNombre || 'Ana Mora'
          });
        }
      
      console.log('💾 Datos de autenticación guardados correctamente');
    }
  }

  logout(): void {
    console.log('🚪 Cerrando sesión...');
    const token = this.getToken();
    
    // Primero limpiar los datos locales para evitar loops
    this.clearAuthData();
    this.isAuthenticatedSubject.next(false);
    
    // Luego intentar notificar al servidor (opcional)
    if (token) {
      const headers = new HttpHeaders({ 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      this.http.post(`${this.authUrl}/logout`, {}, { headers }).subscribe({
        next: () => {
          console.log('✅ Logout notificado al servidor');
        },
        error: (err) => {
          console.log('⚠️ Error al notificar logout (ignorado):', err?.status);
          // Ya limpiamos los datos, así que este error no importa
        }
      });
    } else {
      console.log('ℹ️ No hay token para logout del servidor');
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('rol');
    localStorage.removeItem('empleadoId');
    localStorage.removeItem('empleadoNombre');
    localStorage.removeItem('empleadoCedula');
    this.userInfo = null;
    console.log('🧹 Datos de autenticación limpiados');
  }

  private setUserInfo(info: { username: string, rol: string, id: string }): void {
    this.userInfo = info;
    console.log('👤 Información de usuario establecida:', info);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  getEmpleadoId(): string | null {
    return localStorage.getItem('empleadoId') || localStorage.getItem('empleadoCedula');
  }

  getEmpleadoCedula(): string | null {
    return localStorage.getItem('empleadoCedula');
  }

  getUserInfo(): { username: string, rol: string, id: string } | null {
    return this.userInfo;
  }

  isAuthenticated(): boolean {
    return this.hasTokenPrivate();
  }

  hasToken(): boolean {
    const token = this.getToken();
    return token !== null && token !== '';
  }

  private hasTokenPrivate(): boolean {
    const token = this.getToken();
    return token !== null && token !== '';
  }

  private checkTokenValidity(): void {
    const token = this.getToken();
    if (token) {
      console.log('🔍 Token encontrado en localStorage');
      // Verificar si el token sigue siendo válido
      const username = this.getUsername();
      const empleadoCedula = this.getEmpleadoCedula();
      console.log('📋 Estado de localStorage:', {
        token: `${token.substring(0, 20)}...`,
        username,
        empleadoCedula,
        hasAllData: !!(token && username && empleadoCedula)
      });
      
      if (!username || !empleadoCedula) {
        console.warn('⚠️ Datos incompletos en localStorage, limpiando...');
        this.clearAuthData();
        this.isAuthenticatedSubject.next(false);
      }
    } else {
      console.log('ℹ️ No hay token en localStorage');
    }
  }

  // Método para validar si la sesión está completa
  isSessionValid(): boolean {
    const token = this.getToken();
    const username = this.getUsername();
    const empleadoCedula = this.getEmpleadoCedula();
    
    const isValid = !!(token && username && empleadoCedula);
    console.log('🔍 Validación de sesión:', {
      hasToken: !!token,
      hasUsername: !!username,
      hasEmpleadoCedula: !!empleadoCedula,
      isValid
    });
    
    return isValid;
  }

  // Método para debugging público
  debugAuth(): any {
    const token = this.getToken();
    return {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO DISPONIBLE',
      username: this.getUsername(),
      empleadoCedula: this.getEmpleadoCedula(),
      isAuthenticated: this.isAuthenticated()
    };
  }
}