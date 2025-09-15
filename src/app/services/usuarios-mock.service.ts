import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { UsuarioCompleto, Genero, EstadoCivil, Nacionalidad, Departamento, Puesto } from './usuarios.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosMockService {

  // Datos simulados
  private usuarios: UsuarioCompleto[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@infinihr.com',
      rol: 'ADMIN',
      activo: true,
      cedula: '1234567890',
      nombre: 'Juan Carlos',
      apellidos: 'Pérez González',
      correo: 'juan.perez@infinihr.com',
      telefono: '555-0123',
      direccion: 'Av. Principal 123, Ciudad',
      fechaIngreso: '2023-01-15',
      fechaNacimiento: '1985-05-20',
      salarioBase: 75000,
      generoId: 1,
      estadoCivilId: 1,
      nacionalidadId: 1,
      departamentoId: 1,
      puestoId: 1,
      genero: { id: 1, nombre: 'Masculino' },
      estado_civil: { id: 1, nombre: 'Soltero' },
      nacionalidad: { id: 1, nombre: 'Ecuatoriano' },
      departamento: { id: 1, nombre: 'Administración', descripcion: 'Departamento de Administración' },
      puesto: { id: 1, nombre: 'Administrador General', descripcion: 'Administrador del sistema', departamentoId: 1, salarioBase: 75000, nivel: 'Senior' }
    },
    {
      id: 2,
      username: 'empleado1',
      email: 'maria.garcia@infinihr.com',
      rol: 'empleado',
      activo: true,
      cedula: '0987654321',
      nombre: 'María Elena',
      apellidos: 'García Rodríguez',
      correo: 'maria.garcia@infinihr.com',
      telefono: '555-0456',
      direccion: 'Calle Secundaria 456, Ciudad',
      fechaIngreso: '2023-03-20',
      fechaNacimiento: '1990-08-15',
      salarioBase: 45000,
      generoId: 2,
      estadoCivilId: 2,
      nacionalidadId: 1,
      departamentoId: 2,
      puestoId: 2,
      genero: { id: 2, nombre: 'Femenino' },
      estado_civil: { id: 2, nombre: 'Casado' },
      nacionalidad: { id: 1, nombre: 'Ecuatoriano' },
      departamento: { id: 2, nombre: 'Recursos Humanos', descripcion: 'Departamento de RR.HH.' },
      puesto: { id: 2, nombre: 'Especialista en RRHH', descripcion: 'Especialista en Recursos Humanos', departamentoId: 2, salarioBase: 45000, nivel: 'Junior' }
    }
  ];

  private generos: Genero[] = [
    { id: 1, nombre: 'Masculino' },
    { id: 2, nombre: 'Femenino' },
    { id: 3, nombre: 'Otro' }
  ];

  private estadosCiviles: EstadoCivil[] = [
    { id: 1, nombre: 'Soltero' },
    { id: 2, nombre: 'Casado' },
    { id: 3, nombre: 'Divorciado' },
    { id: 4, nombre: 'Viudo' },
    { id: 5, nombre: 'Unión libre' }
  ];

  private nacionalidades: Nacionalidad[] = [
    { id: 1, nombre: 'Ecuatoriano' },
    { id: 2, nombre: 'Colombiano' },
    { id: 3, nombre: 'Peruano' },
    { id: 4, nombre: 'Venezolano' },
    { id: 5, nombre: 'Argentino' },
    { id: 6, nombre: 'Mexicano' },
    { id: 7, nombre: 'Brasileño' },
    { id: 8, nombre: 'Chileno' },
    { id: 9, nombre: 'Uruguayo' },
    { id: 10, nombre: 'Paraguayo' },
    { id: 11, nombre: 'Boliviano' },
    { id: 12, nombre: 'Estadounidense' },
    { id: 13, nombre: 'Canadiense' },
    { id: 14, nombre: 'Español' },
    { id: 15, nombre: 'Francés' },
    { id: 16, nombre: 'Alemán' },
    { id: 17, nombre: 'Italiano' },
    { id: 18, nombre: 'Portugués' },
    { id: 19, nombre: 'Inglés' },
    { id: 20, nombre: 'Irlandés' },
    { id: 21, nombre: 'Holandés' },
    { id: 22, nombre: 'Belga' },
    { id: 23, nombre: 'Suizo' },
    { id: 24, nombre: 'Austriaco' },
    { id: 25, nombre: 'Griego' },
    { id: 26, nombre: 'Turco' },
    { id: 27, nombre: 'Ruso' },
    { id: 28, nombre: 'Polaco' },
    { id: 29, nombre: 'Checo' },
    { id: 30, nombre: 'Húngaro' },
    { id: 31, nombre: 'Rumano' },
    { id: 32, nombre: 'Búlgaro' },
    { id: 33, nombre: 'Croata' },
    { id: 34, nombre: 'Serbio' },
    { id: 35, nombre: 'Esloveno' },
    { id: 36, nombre: 'Eslovaco' },
    { id: 37, nombre: 'Ucraniano' },
    { id: 38, nombre: 'Bielorruso' },
    { id: 39, nombre: 'Lituano' },
    { id: 40, nombre: 'Letón' },
    { id: 41, nombre: 'Estonio' },
    { id: 42, nombre: 'Finlandés' },
    { id: 43, nombre: 'Sueco' },
    { id: 44, nombre: 'Noruego' },
    { id: 45, nombre: 'Danés' },
    { id: 46, nombre: 'Islandés' },
    { id: 47, nombre: 'Chino' },
    { id: 48, nombre: 'Japonés' },
    { id: 49, nombre: 'Coreano' },
    { id: 50, nombre: 'Indio' },
    { id: 51, nombre: 'Pakistaní' },
    { id: 52, nombre: 'Bangladesí' },
    { id: 53, nombre: 'Tailandés' },
    { id: 54, nombre: 'Vietnamita' },
    { id: 55, nombre: 'Filipino' },
    { id: 56, nombre: 'Indonesio' },
    { id: 57, nombre: 'Malayo' },
    { id: 58, nombre: 'Singapurense' },
    { id: 59, nombre: 'Australiano' },
    { id: 60, nombre: 'Neozelandés' },
    { id: 61, nombre: 'Sudafricano' },
    { id: 62, nombre: 'Egipcio' },
    { id: 63, nombre: 'Marroquí' },
    { id: 64, nombre: 'Argelino' },
    { id: 65, nombre: 'Tunecino' },
    { id: 66, nombre: 'Libio' },
    { id: 67, nombre: 'Nigeriano' },
    { id: 68, nombre: 'Ghanés' },
    { id: 69, nombre: 'Keniano' },
    { id: 70, nombre: 'Etíope' },
    { id: 71, nombre: 'Israelí' },
    { id: 72, nombre: 'Palestino' },
    { id: 73, nombre: 'Jordano' },
    { id: 74, nombre: 'Libanés' },
    { id: 75, nombre: 'Sirio' },
    { id: 76, nombre: 'Iraquí' },
    { id: 77, nombre: 'Iraní' },
    { id: 78, nombre: 'Afgano' },
    { id: 79, nombre: 'Saudí' },
    { id: 80, nombre: 'Emiratí' },
    { id: 81, nombre: 'Catarí' },
    { id: 82, nombre: 'Kuwaití' },
    { id: 83, nombre: 'Dominicano' },
    { id: 84, nombre: 'Puertorriqueño' },
    { id: 85, nombre: 'Cubano' },
    { id: 86, nombre: 'Jamaiquino' },
    { id: 87, nombre: 'Haitiano' },
    { id: 88, nombre: 'Costarricense' },
    { id: 89, nombre: 'Panameño' },
    { id: 90, nombre: 'Nicaragüense' },
    { id: 91, nombre: 'Hondureño' },
    { id: 92, nombre: 'Salvadoreño' },
    { id: 93, nombre: 'Guatemalteco' },
    { id: 94, nombre: 'Beliceño' },
    { id: 999, nombre: 'Otra (especificar)' }
  ];

  private departamentos: Departamento[] = [
    { id: 1, nombre: 'Administración', descripcion: 'Departamento de Administración General' },
    { id: 2, nombre: 'Recursos Humanos', descripcion: 'Departamento de Recursos Humanos' },
    { id: 3, nombre: 'Tecnología', descripcion: 'Departamento de Tecnología e Innovación' },
    { id: 4, nombre: 'Ventas', descripcion: 'Departamento de Ventas y Marketing' },
    { id: 5, nombre: 'Contabilidad', descripcion: 'Departamento de Contabilidad y Finanzas' }
  ];

  private puestos: Puesto[] = [
    { id: 1, nombre: 'Administrador General', descripcion: 'Administrador del sistema', departamentoId: 1, salarioBase: 75000, nivel: 'Senior' },
    { id: 2, nombre: 'Especialista en RRHH', descripcion: 'Especialista en Recursos Humanos', departamentoId: 2, salarioBase: 45000, nivel: 'Junior' },
    { id: 3, nombre: 'Desarrollador Senior', descripcion: 'Desarrollador de Software Senior', departamentoId: 3, salarioBase: 65000, nivel: 'Senior' },
    { id: 4, nombre: 'Analista de Ventas', descripcion: 'Analista de Ventas y Marketing', departamentoId: 4, salarioBase: 40000, nivel: 'Junior' },
    { id: 5, nombre: 'Contador', descripcion: 'Contador General', departamentoId: 5, salarioBase: 50000, nivel: 'Mid' }
  ];

  // Métodos simulados
  getUsuariosCompletos(): Observable<UsuarioCompleto[]> {
    console.log('🧪 Mock: Obteniendo usuarios completos');
    return of(this.usuarios).pipe(delay(500));
  }

  getUsuarioCompleto(id: number): Observable<UsuarioCompleto> {
    const usuario = this.usuarios.find(u => u.id === id);
    if (usuario) {
      return of(usuario).pipe(delay(300));
    }
    return throwError(() => new Error('Usuario no encontrado'));
  }

  createUsuarioCompleto(usuario: UsuarioCompleto): Observable<any> {
    console.log('🧪 Mock: Creando usuario', usuario);
    const newId = Math.max(...this.usuarios.map(u => u.id || 0)) + 1;
    const newUsuario = { ...usuario, id: newId };
    this.usuarios.push(newUsuario);
    return of(newUsuario).pipe(delay(1000));
  }

  updateUsuarioCompleto(id: number, usuario: Partial<UsuarioCompleto>): Observable<any> {
    console.log('🧪 Mock: Actualizando usuario', id, usuario);
    const index = this.usuarios.findIndex(u => u.id === id);
    if (index !== -1) {
      this.usuarios[index] = { ...this.usuarios[index], ...usuario };
      return of(this.usuarios[index]).pipe(delay(800));
    }
    return throwError(() => new Error('Usuario no encontrado'));
  }

  deleteUsuario(id: number): Observable<void> {
    console.log('🧪 Mock: Eliminando usuario', id);
    const index = this.usuarios.findIndex(u => u.id === id);
    if (index !== -1) {
      this.usuarios.splice(index, 1);
      return of(undefined).pipe(delay(500));
    }
    return throwError(() => new Error('Usuario no encontrado'));
  }

  toggleUserStatus(id: number, activo: boolean): Observable<any> {
    console.log('🧪 Mock: Cambiando estado de usuario', id, activo);
    const usuario = this.usuarios.find(u => u.id === id);
    if (usuario) {
      usuario.activo = activo;
      return of(usuario).pipe(delay(500));
    }
    return throwError(() => new Error('Usuario no encontrado'));
  }

  // Datos relacionales
  getGeneros(): Observable<Genero[]> {
    return of(this.generos).pipe(delay(200));
  }

  getEstadosCiviles(): Observable<EstadoCivil[]> {
    return of(this.estadosCiviles).pipe(delay(200));
  }

  getNacionalidades(): Observable<Nacionalidad[]> {
    return of(this.nacionalidades).pipe(delay(200));
  }

  getDepartamentos(): Observable<Departamento[]> {
    return of(this.departamentos).pipe(delay(200));
  }

  getPuestos(): Observable<Puesto[]> {
    return of(this.puestos).pipe(delay(200));
  }

  getPuestosPorDepartamento(departamentoId: number): Observable<Puesto[]> {
    const puestosFiltrados = this.puestos.filter(p => p.departamentoId === departamentoId);
    return of(puestosFiltrados).pipe(delay(200));
  }

  // Validaciones simuladas
  verificarUsername(username: string, excludeId?: number): Observable<{ disponible: boolean }> {
    const existe = this.usuarios.some(u => u.username === username && u.id !== excludeId);
    return of({ disponible: !existe }).pipe(delay(300));
  }

  verificarEmail(email: string, excludeId?: number): Observable<{ disponible: boolean }> {
    const existe = this.usuarios.some(u => u.email === email && u.id !== excludeId);
    return of({ disponible: !existe }).pipe(delay(300));
  }

  verificarCedula(cedula: string, excludeId?: string): Observable<{ disponible: boolean }> {
    const existe = this.usuarios.some(u => u.cedula === cedula && u.id?.toString() !== excludeId);
    return of({ disponible: !existe }).pipe(delay(300));
  }
}
