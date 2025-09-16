    import { Injectable } from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import { Observable } from 'rxjs';

    export interface EmpleadoDTO {
    id?: string;
    nombre?: string;
    apellidos?: string;
    username?: string;
    correo?: string;
    puesto?: string;
    puestoId?: number;
    departamentoId?: number;
    fechaIngreso?: string;
    fechaNacimiento?: string;
    telefono?: string;
    direccion?: string;
    salarioBase?: number;
    supervisorId?: string;
    rol?: string;
    activo?: boolean;
    generoId?: number;
    estadoCivilId?: number;
    nacionalidadId?: number;
    }

    @Injectable({
    providedIn: 'root'
    })
    export class EmpleadoService {
    private base = '/api/empleados';

    constructor(private http: HttpClient) {}

    getAll(): Observable<EmpleadoDTO[]> {
        return this.http.get<EmpleadoDTO[]>(this.base);
    }

    getById(id: string): Observable<EmpleadoDTO> {
        return this.http.get<EmpleadoDTO>(`${this.base}/${encodeURIComponent(id)}`);
    }

    getMe(): Observable<EmpleadoDTO> {
        return this.http.get<EmpleadoDTO>(`${this.base}/me`);
    }

    create(dto: EmpleadoDTO) {
        return this.http.post<EmpleadoDTO>(this.base, dto);
    }

    update(id: string, dto: Partial<EmpleadoDTO>) {
        return this.http.put<EmpleadoDTO>(`${this.base}/${encodeURIComponent(id)}`, dto);
    }

    delete(id: string) {
        return this.http.delete<void>(`${this.base}/${encodeURIComponent(id)}`);
    }
    }
