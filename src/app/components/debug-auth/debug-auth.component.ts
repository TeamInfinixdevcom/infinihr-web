    import { Component } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { MatButtonModule } from '@angular/material/button';
    import { MatCardModule } from '@angular/material/card';
    import { AuthService } from '../../services/auth/auth.service';
    import { UsuariosService } from '../../services/usuarios.service';

    @Component({
    selector: 'app-debug-auth',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatCardModule],
    template: `
        <mat-card>
        <mat-card-header>
            <mat-card-title>🔍 Debug de Autenticación</mat-card-title>
        </mat-card-header>
        <mat-card-content>
            <p>Usa los botones para verificar el estado de la autenticación:</p>
            
            <button mat-raised-button color="primary" (click)="debugAuth()" style="margin: 5px;">
            Ver Estado de Auth
            </button>
            
            <button mat-raised-button color="accent" (click)="verifyToken()" style="margin: 5px;">
            Verificar Token
            </button>
            
            <button mat-raised-button color="warn" (click)="testUsuarios()" style="margin: 5px;">
            Probar /api/usuarios
            </button>
            
            <button mat-raised-button color="primary" (click)="testAuth()" style="margin: 5px;">
            Test Auth Básico
            </button>
            
            <button mat-raised-button color="accent" (click)="compareEndpoints()" style="margin: 5px;">
            Comparar Endpoints
            </button>
            
            <button mat-raised-button color="warn" (click)="testWithDirectHeaders()" style="margin: 5px;">
            Test Headers Directos
            </button>
            
            <button mat-raised-button color="primary" (click)="testUpdateUsuario()" style="margin: 5px;">
            🔧 Test Actualizar Usuario
            </button>
            
            <button mat-raised-button color="accent" (click)="testBackendStatus()" style="margin: 5px;">
            🔍 Verificar Backend
            </button>
            
            <button mat-raised-button (click)="clearStorage()" style="margin: 5px;">
            Limpiar Storage
            </button>
            
            <div style="margin-top: 20px; font-family: monospace; background: #f5f5f5; padding: 10px; max-height: 400px; overflow-y: auto;">
            <h3>Resultado del diagnóstico:</h3>
            <p><strong>Estado actual:</strong> {{ authStatus }}</p>
            <div *ngFor="let log of diagnosticLogs" [style.color]="log.type === 'error' ? 'red' : log.type === 'warn' ? 'orange' : 'black'">
                <strong>{{ log.timestamp }}:</strong> {{ log.message }}
            </div>
            </div>
        </mat-card-content>
        </mat-card>
    `
    })
    export class DebugAuthComponent {
    authStatus = 'No verificado';
    diagnosticLogs: Array<{timestamp: string, type: string, message: string}> = [];

    constructor(
        private authService: AuthService,
        private usuariosService: UsuariosService
    ) {
        this.addLog('info', 'Componente de debug inicializado');
        this.debugAuth(); // Llamar directamente a debugAuth en lugar de checkInitialState
    }

    private addLog(type: string, message: string): void {
        const timestamp = new Date().toLocaleTimeString();
        this.diagnosticLogs.push({ timestamp, type, message });
        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
        
        // Mantener solo los últimos 50 logs
        if (this.diagnosticLogs.length > 50) {
        this.diagnosticLogs.shift();
        }
    }

    private checkInitialState(): void {
        const hasToken = !!localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const rol = localStorage.getItem('rol');
        
        this.addLog('info', `Estado inicial - Token: ${hasToken ? 'Presente' : 'Ausente'}, Usuario: ${username || 'N/A'}, Rol: ${rol || 'N/A'}`);
        this.authStatus = hasToken ? 'Token encontrado' : 'Sin token';
    }

    debugAuth(): void {
        this.addLog('info', '=== DEBUGGING AUTH STATE ===');
        const estado = this.authService.debugAuth();
        this.authStatus = estado.isAuthenticated ? 'Autenticado' : 'No autenticado';
        this.addLog('info', `Autenticado: ${estado.isAuthenticated}, Token: ${estado.hasToken ? 'Sí' : 'No'}, Usuario: ${estado.username || 'N/A'}`);
        
        // Revisar TODO el localStorage
        this.addLog('info', '🗂️ Revisando localStorage completo:');
        for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key!);
        this.addLog('info', `   • ${key}: ${value ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : 'NULL'}`);
        }
    }

    verifyToken(): void {
        this.addLog('info', '=== VERIFICANDO TOKEN ===');
        this.authService.verifyToken();
        const rawToken = localStorage.getItem('token');
        this.addLog('info', `Token crudo: ${rawToken ? rawToken.substring(0, 30) + '...' : 'NULL'}`);
        
        // Decodificar el JWT para ver el payload
        if (rawToken) {
        try {
            const parts = rawToken.split('.');
            if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            this.addLog('info', '📋 Payload del JWT decodificado:');
            this.addLog('info', `   • Usuario: ${payload.sub || 'N/A'}`);
            this.addLog('info', `   • Roles: ${JSON.stringify(payload.roles || payload.authorities || 'No encontrado')}`);
            this.addLog('info', `   • Expira: ${payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A'}`);
            this.addLog('info', `   • Payload completo: ${JSON.stringify(payload, null, 2)}`);
            }
        } catch (error) {
            this.addLog('error', `❌ Error decodificando JWT: ${error}`);
        }
        }
    }

    testUsuarios(): void {
        this.addLog('info', '=== PROBANDO /api/usuarios ===');
        
        // Primero verificar el token
        this.authService.verifyToken();
        
        // Mostrar información del localStorage
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('rol');
        this.addLog('info', `📋 LocalStorage - Token: ${token ? 'Sí (' + token.substring(0, 20) + '...)' : 'No'}`);
        this.addLog('info', `📋 LocalStorage - Rol: ${role || 'No encontrado'}`);
        
        // Luego probar la API
        this.addLog('info', '🚀 Llamando usuariosService.getUsuarios()...');
        this.usuariosService.getUsuarios().subscribe({
        next: (usuarios) => {
            this.addLog('info', `✅ Usuarios obtenidos exitosamente: ${usuarios.length} usuarios`);
            this.authStatus = 'API funcionando';
        },
        error: (error) => {
            this.addLog('error', `❌ Error al obtener usuarios: ${error.status} - ${error.statusText}`);
            this.authStatus = `Error ${error.status}: ${error.statusText}`;
            
            // Análisis adicional del error 403
            if (error.status === 403) {
            this.addLog('warn', '🔍 Análisis del error 403: Revisar logs detallados arriba');
            this.addLog('warn', '   • ¿El backend recibió el token? Revisar logs del servidor');
            this.addLog('warn', '   • ¿El token es válido? Ver decodificación JWT');
            this.addLog('warn', '   • ¿El usuario tiene permisos? El rol debe ser ADMIN');
            this.addLog('warn', '   • ¿Se envió el header X-User-Role? Buscar logs del UsuariosService arriba');
            }
        }
        });
    }

    // Nuevo método para probar solo la autenticación básica
    testAuth(): void {
        this.addLog('info', '=== PROBANDO AUTENTICACIÓN BÁSICA ===');
        
        const token = localStorage.getItem('token');
        if (!token) {
        this.addLog('error', 'No hay token para probar');
        return;
        }
        
        // Hacer una petición simple que requiera autenticación pero no permisos específicos
        const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
        };
        
        this.addLog('info', `Probando /api/empleados con token: ${token.substring(0, 20)}...`);
        
        fetch('/api/empleados', { 
        method: 'GET',
        headers 
        })
        .then(response => {
        this.addLog('info', `📡 Respuesta de /api/empleados: ${response.status} ${response.statusText}`);
        
        if (response.status === 403) {
            this.addLog('error', '❌ También 403 en /api/empleados - problema de autenticación general');
        } else if (response.ok) {
            this.addLog('info', '✅ /api/empleados funciona - problema específico de permisos en /api/usuarios');
        }
        
        return response.text();
        })
        .then(body => {
        this.addLog('info', `📄 Body de la respuesta (primeros 100 chars): ${body.substring(0, 100)}...`);
        })
        .catch(err => {
        this.addLog('error', `❌ Error en fetch: ${err.message}`);
        });
    }

    // Nuevo método para comparar cómo responden diferentes endpoints
    compareEndpoints(): void {
        this.addLog('info', '=== COMPARANDO ENDPOINTS ===');
        const token = localStorage.getItem('token');
        
        if (!token) {
        this.addLog('error', 'No hay token para comparar');
        return;
        }

        const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
        };

        this.addLog('info', '🔄 Probando múltiples endpoints...');

        // Test /api/empleados (que sabemos que funciona)
        fetch('/api/empleados', { method: 'GET', headers })
        .then(response => {
            this.addLog('info', `✅ /api/empleados: ${response.status} ${response.statusText}`);
            return response.headers;
        })
        .then(responseHeaders => {
            this.addLog('info', `   Headers de respuesta: ${JSON.stringify(Object.fromEntries(responseHeaders.entries()))}`);
        })
        .catch(err => this.addLog('error', `❌ Error en /api/empleados: ${err.message}`));

        // Test /api/usuarios (que da 403)
        setTimeout(() => {
        fetch('/api/usuarios', { method: 'GET', headers })
            .then(response => {
            this.addLog('warn', `❌ /api/usuarios: ${response.status} ${response.statusText}`);
            return response.text();
            })
            .then(errorBody => {
            this.addLog('warn', `   Cuerpo del error: ${errorBody.substring(0, 200)}...`);
            })
            .catch(err => this.addLog('error', `❌ Error en /api/usuarios: ${err.message}`));
        }, 1000);

        // Test otros endpoints para ver el patrón
        setTimeout(() => {
        fetch('/api/vacaciones', { method: 'GET', headers })
            .then(response => {
            this.addLog('info', `📊 /api/vacaciones: ${response.status} ${response.statusText}`);
            })
            .catch(err => this.addLog('error', `❌ Error en /api/vacaciones: ${err.message}`));
        }, 2000);
    }

    // Nuevo método para probar headers directamente con fetch
    testWithDirectHeaders(): void {
        this.addLog('info', '=== PROBANDO HEADERS DIRECTOS ===');
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('rol');
        
        if (!token) {
        this.addLog('error', 'No hay token para probar');
        return;
        }

        // Probar múltiples variaciones de headers de rol
        const headerVariations = [
        { name: 'X-User-Role', value: role },
        { name: 'User-Role', value: role },
        { name: 'Role', value: role },
        { name: 'X-Role', value: role },
        { name: 'authorities', value: role },
        { name: 'roles', value: role }
        ];

        this.addLog('info', `🧪 Probando ${headerVariations.length} variaciones de headers con /api/usuarios`);

        headerVariations.forEach((headerVar, index) => {
        setTimeout(() => {
            const headers: any = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
            };
            
            if (headerVar.value) {
            headers[headerVar.name] = headerVar.value;
            }

            this.addLog('info', `🔬 Test ${index + 1}: Header "${headerVar.name}: ${headerVar.value}"`);

            fetch('/api/usuarios', { 
            method: 'GET',
            headers 
            })
            .then(response => {
            if (response.ok) {
                this.addLog('info', `✅ ¡ÉXITO! Header "${headerVar.name}" funcionó: ${response.status}`);
                return response.json();
            } else {
                this.addLog('warn', `❌ Header "${headerVar.name}" falló: ${response.status} ${response.statusText}`);
                return response.text();
            }
            })
            .then(data => {
            if (typeof data === 'object') {
                this.addLog('info', `📄 Datos obtenidos: ${Array.isArray(data) ? data.length + ' usuarios' : 'objeto'}`);
            }
            })
            .catch(err => {
            this.addLog('error', `❌ Error con header "${headerVar.name}": ${err.message}`);
            });
        }, index * 1000); // Esperar 1 segundo entre cada prueba
        });
    }

    clearStorage(): void {
        this.addLog('info', '=== LIMPIANDO STORAGE ===');
        localStorage.clear();
        this.authStatus = 'Storage limpiado';
        this.addLog('info', 'Storage limpiado. Recarga la página y haz login nuevamente.');
        this.diagnosticLogs = []; // Limpiar logs también
    }

    testUpdateUsuario(): void {
        this.addLog('info', '=== PROBANDO ACTUALIZACIÓN DE USUARIO ===');
        
        // Vamos a probar actualizar el usuario admin (ID 1) con un pequeño cambio
        const datosActualizacion = {
            username: 'admin',
            password: 'admin123', // ✅ Cambiado a 8 caracteres para cumplir validación mínima
            email: `admin.test.${Date.now()}@example.com`, // Email único para probar
            rol: 'ADMIN',
            activo: true,
            cedula: '115390283',
            nombre: 'Administrador del Sistema',
            apellidos: 'Updated'
        };
        
        this.addLog('info', `📝 Datos a enviar: ${JSON.stringify(datosActualizacion, null, 2)}`);
        this.addLog('info', '🚀 Llamando usuariosService.updateUsuario(1, datos)...');
        
        this.usuariosService.updateUsuario(1, datosActualizacion)
            .subscribe({
                next: (resultado) => {
                    this.addLog('info', `✅ Usuario actualizado exitosamente!`);
                    this.addLog('info', `📄 Resultado: ${JSON.stringify(resultado, null, 2)}`);
                    this.authStatus = '✅ Actualización exitosa';
                },
                error: (error) => {
                    this.addLog('error', `❌ Error al actualizar usuario: ${error.status} - ${error.statusText}`);
                    this.addLog('error', `📄 Detalle del error: ${JSON.stringify(error, null, 2)}`);
                    this.authStatus = `❌ Error ${error.status}: ${error.statusText}`;
                    
                    // Análisis del error específico
                    if (error.status === 403) {
                        this.addLog('warn', '🔍 Error 403 - Revisando posibles causas:');
                        this.addLog('warn', '   • ¿Headers correctos enviados? Ver logs de UsuariosService arriba');
                        this.addLog('warn', '   • ¿Backend recibió el token? Revisar logs del servidor');
                        this.addLog('warn', '   • ¿Endpoint correcto? Debería ser PUT /api/usuarios/1');
                    }
                }
            });
    }

    testBackendStatus(): void {
        this.addLog('info', '=== VERIFICANDO ESTADO DEL BACKEND ===');
        
        const endpoints = [
            { url: '/api/usuarios', method: 'GET' },
            { url: '/api/usuarios', method: 'POST' },
            { url: '/api/empleados', method: 'GET' },
            { url: '/api/empleados', method: 'POST' },
            { url: '/api/auth/verify', method: 'GET' },
            { url: '/api/usuarios/register-completo', method: 'POST' }
        ];
        
        endpoints.forEach((endpoint, index) => {
            setTimeout(() => {
                this.addLog('info', `🔗 Probando: ${endpoint.method} ${endpoint.url}`);
                
                const options: any = {
                    method: endpoint.method,
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'X-User-Role': 'ROLE_ADMIN',
                        'Content-Type': 'application/json'
                    }
                };
                
                // Para POST, agregar body de prueba
                if (endpoint.method === 'POST') {
                    options.body = JSON.stringify({ test: 'data' });
                }
                
                fetch(endpoint.url, options)
                .then(response => {
                    if (response.ok) {
                        this.addLog('info', `✅ ${endpoint.method} ${endpoint.url}: ${response.status} OK`);
                    } else {
                        this.addLog('warn', `⚠️ ${endpoint.method} ${endpoint.url}: ${response.status} ${response.statusText}`);
                    }
                })
                .catch(error => {
                    this.addLog('error', `❌ ${endpoint.method} ${endpoint.url}: Error - ${error.message}`);
                });
            }, index * 500);
        });
    }
}