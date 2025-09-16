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
              // Completar inmediatamente después del login exitoso
              // La búsqueda de empleado se hará en segundo plano sin bloquear el login
              observer.next(response);
              observer.complete();

              // Intentar obtener información del empleado en segundo plano (no bloqueante)
              const cedulaFromResponse = response.empleadoId?.toString() || response.id?.toString();
              if (!cedulaFromResponse) {
                console.log('🔎 Buscando información del empleado en segundo plano...');
                this.http.get<any[]>(`${this.apiUrl}/empleados`).subscribe({
                  next: empleados => {
                    try {
                      const found = empleados.find(e => e.username === response.username);
                      if (found && found.id) {
                        const ced = found.id.toString();
                        localStorage.setItem('empleadoCedula', ced);
                        localStorage.setItem('empleadoId', ced);
                        localStorage.setItem('empleadoNombre', found.nombre || '');
                        console.log('✅ Información del empleado actualizada:', ced);
                      }
                    } catch (e) {
                      console.warn('⚠️ Error procesando información del empleado (no crítico):', e);
                    }
                  },
                  error: (err) => {
                    console.warn('⚠️ No se pudo obtener información del empleado (no crítico):', err);
                  }
                });
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
    console.log('🔒 Guardando datos de autenticación:', response);
    console.log('🔍 [DEBUG] Análisis detallado de la respuesta:', {
      hasToken: !!response.token,
      hasUsername: !!response.username,
      hasRol: !!response.rol,
      rolValue: response.rol,
      rolType: typeof response.rol,
      completeResponse: response
    });
    
    if (response.token) {
      // Almacenar token crudo (sin prefijo). El interceptor agrega 'Bearer ' al enviar.
      const rawToken = response.token.startsWith('Bearer ') ? response.token.substring(7) : response.token;
      localStorage.setItem('token', rawToken);
      localStorage.setItem('username', response.username || '');
      localStorage.setItem('rol', response.rol || '');
      
      console.log('✅ Datos guardados en localStorage:', {
        token: rawToken.substring(0, 20) + '...',
        username: response.username,
        rol: response.rol,
        localStorage_rol: localStorage.getItem('rol')
      });
      
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
    
    // Luego intentar notificar al servidor (opcional y no bloqueante)
    if (token) {
      const headers = new HttpHeaders({ 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      // Usar timeout y manejo de errores más robusto
      this.http.post(`${this.authUrl}/logout`, {}, { headers }).subscribe({
        next: () => {
          console.log('✅ Logout notificado al servidor');
        },
        error: (err) => {
          console.log('⚠️ Error al notificar logout (ignorado):', err?.status || 'desconocido');
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
    const token = localStorage.getItem('token');
    console.log('🔍 [AuthService.getToken] Token crudo:', token ? `${token.substring(0, 20)}...` : 'NULL');
    
    if (!token) {
      return null;
    }
    
    // Devolver el token tal como está almacenado
    // El interceptor o el servicio que lo use añadirá "Bearer " si es necesario
    return token;
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  getCurrentRole(): string | null {
    return this.getRol();
  }

  hasRole(role: string): boolean {
    const currentRole = this.getRol();
    if (!currentRole) {
      return false;
    }

    // Normalizar valores posibles que vengan del backend:
    // - JSON string array: "[\"ADMIN\"]"
    // - Comma/space separated: "ADMIN,USER" or "ADMIN USER"
    // - Prefijos: ROLE_ADMIN
    // - Diferente case: "admin"
    let normalized = currentRole;
    try {
      const parsed = JSON.parse(currentRole);
      if (Array.isArray(parsed)) {
        normalized = parsed.join(',');
      }
    } catch (e) {
      // not JSON -> ignore
    }

    normalized = String(normalized);
    // Remove common prefixes and quotes/brackets
    normalized = normalized.replace(/ROLE_/gi, '');
    normalized = normalized.replace(/[\[\]"]+/g, '');

    const tokens = normalized
      .split(/[,;\s]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map(t => t.toLowerCase());

    return tokens.includes(role.toLowerCase());
  }

  isAdmin(): boolean {
    const is = this.hasRole('ADMIN');
    console.log('🔍 [DEBUG] isAdmin check ->', { is, rolRaw: this.getRol(), username: this.getUsername() });
    return is;
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
      
      // Verificar si el token es un JWT y si ha expirado
      if (!token.startsWith('Bearer ')) {
        const isExpired = this.isTokenExpired(token);
        if (isExpired) {
          console.warn('⚠️ Token expirado detectado, limpiando datos...');
          this.clearAuthData();
          this.isAuthenticatedSubject.next(false);
          return;
        }
      }
      
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

  // Método para verificar si el token JWT ha expirado
  private isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('⚠️ Token no es un JWT válido');
        return true;
      }

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        console.warn('⚠️ Token expirado:', {
          exp: payload.exp,
          expDate: new Date(payload.exp * 1000),
          currentTime,
          currentDate: new Date()
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error al verificar expiración del token:', error);
      return true; // Si hay error, considerar expirado por seguridad
    }
  }

  // Método público para forzar logout cuando se detecta sesión inválida
  public handleExpiredSession(reason: string = 'Sesión expirada'): void {
    console.warn(`🚫 [AuthService] ${reason}`);
    this.clearAuthData();
    this.isAuthenticatedSubject.next(false);
  }

  // Método público para limpiar sesión y recargar (útil para debugging)
  public forceResetSession(): void {
    console.log('🧹 [AuthService] Forzando reset de sesión...');
    this.clearAuthData();
    this.isAuthenticatedSubject.next(false);
    console.log('🔄 [AuthService] Recargando página...');
    window.location.reload();
  }

  // Método temporal para debugging en la consola
  public debugCurrentState(): void {
    const token = this.getToken();
    const username = this.getUsername();
    const rol = this.getRol();
    
    console.log('🔍 [AuthService] Estado actual de autenticación:');
    console.log('  • Token existe:', !!token);
    console.log('  • Token preview:', token ? `${token.substring(0, 30)}...` : 'NO HAY TOKEN');
    console.log('  • Username:', username || 'NO DISPONIBLE');
    console.log('  • Rol:', rol || 'NO DISPONIBLE');
    console.log('  • isAuthenticated():', this.isAuthenticated());
    
    if (token && !token.startsWith('Bearer ')) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          console.log('  • Token payload:', {
            sub: payload.sub,
            exp: payload.exp,
            expDate: payload.exp ? new Date(payload.exp * 1000) : 'No exp',
            isExpired: payload.exp ? payload.exp < currentTime : 'No exp'
          });
        }
      } catch (e) {
        console.error('  • Error decodificando token:', e);
      }
    }
    
    console.log('💡 Para limpiar sesión ejecuta: authService.forceResetSession()');
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
    const estado = {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO DISPONIBLE',
      tokenLength: token?.length || 0,
      username: this.getUsername(),
      rol: this.getRol(),
      empleadoCedula: this.getEmpleadoCedula(),
      isAuthenticated: this.isAuthenticated(),
      isSessionValid: this.isSessionValid()
    };
    
    console.log('🔍 [AuthService] Estado completo de autenticación:', estado);
    return estado;
  }

  // Método público para verificar el token específicamente
  public verifyToken(): void {
    console.log('🔍 [AuthService] Verificación manual del token:');
    const rawToken = localStorage.getItem('token');
    console.log('   • Token crudo desde localStorage:', rawToken ? `${rawToken.substring(0, 50)}...` : 'NULL');
    console.log('   • Longitud del token crudo:', rawToken?.length || 0);
    console.log('   • Comienza con Bearer:', rawToken?.startsWith('Bearer ') ? 'SÍ' : 'NO');
    
    const processedToken = this.getToken();
    console.log('   • Token procesado por getToken():', processedToken ? `${processedToken.substring(0, 50)}...` : 'NULL');
    console.log('   • Longitud del token procesado:', processedToken?.length || 0);
    
    // Verificar si es un JWT válido
    if (rawToken && !rawToken.startsWith('Bearer ')) {
      const parts = rawToken.split('.');
      console.log('   • Partes del JWT (header.payload.signature):', parts.length);
      if (parts.length === 3) {
        try {
          const header = JSON.parse(atob(parts[0]));
          const payload = JSON.parse(atob(parts[1]));
          console.log('   • Header del JWT:', header);
          console.log('   • Payload del JWT:', {
            sub: payload.sub,
            exp: payload.exp,
            iat: payload.iat,
            expDate: payload.exp ? new Date(payload.exp * 1000) : 'No exp'
          });
        } catch (e) {
          console.error('   • Error decodificando JWT:', e);
        }
      }
    }
    
    console.log('   • Formato esperado: Bearer <jwt_token>');
  }
}