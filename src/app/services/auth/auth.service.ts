import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface AuthResponse {
  token?: string;
  username?: string;
  rol?: string;
  id?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api'; // Usar proxy en lugar de URL completa
  private authUrl = `${this.apiUrl}/auth`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private userInfo: { username: string, rol: string, id: string } | null = null;

  constructor(private http: HttpClient) {
    console.log('🔐 AuthService inicializado');
    console.log('🌐 API URL:', this.apiUrl);
    this.checkTokenValidity();
  }

  login(username: string, password: string): Observable<AuthResponse> {
    console.log('🔑 Iniciando autenticación...');
    
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, { username, password }).pipe(
      tap(response => {
        if (response.token) {
          console.log('✅ Login exitoso');
          this.storeAuthData(response);
          this.isAuthenticatedSubject.next(true);
          this.setUserInfo({
            username: response.username || '',
            rol: response.rol || '',
            id: response.id?.toString() || ''
          });
        }
      }),
      catchError(error => {
        console.error('❌ Error de autenticación:', error.status);
        this.isAuthenticatedSubject.next(false);
        localStorage.clear();
        throw error;
      })
    );
  }

  // No more simulation methods needed as we have a real backend

  logout(): void {
    console.log('🚪 Cerrando sesión...');
    this.clearAuthData();
    this.isAuthenticatedSubject.next(false);
    
    // Opcional: notificar al servidor
    this.http.post(`${this.authUrl}/logout`, {}).subscribe({
      next: () => console.log('✅ Logout notificado al servidor'),
      error: (err) => console.log('⚠️ Error al notificar logout:', err.status)
    });
  }

  private storeAuthData(response: AuthResponse): void {
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('username', response.username || '');
      localStorage.setItem('rol', response.rol || '');
      console.log('💾 Datos de autenticación guardados:', {
        username: response.username,
        rol: response.rol
      });
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('rol');
    this.userInfo = null;
    console.log('🧹 Datos de autenticación limpiados');
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

  hasRole(role: string): boolean {
    const userRol = this.getRol();
    return userRol === role;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private checkTokenValidity(): void {
    const token = this.getToken();
    if (token) {
      console.log('🔍 Token encontrado en localStorage');
      // Asumir que el token es válido hasta que el servidor responda lo contrario
      this.isAuthenticatedSubject.next(true);
      console.log('✅ Token considerado válido');
    } else {
      console.log('⚠️ No hay token en localStorage');
      this.isAuthenticatedSubject.next(false);
    }
  }

  setUserInfo(info: { username: string, rol: string, id: string }) {
    this.userInfo = info;
  }

  getUserInfo() {
    return this.userInfo;
  }
}