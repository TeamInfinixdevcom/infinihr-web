import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vacacion {
  id: number;
  empleadoId: number;
  fechaInicio: string;
  fechaFin: string;
  estado: 'Pendiente'|'Aprobado'|'Rechazado';
}

@Injectable({ providedIn: 'root' })
export class VacacionesService {
  private readonly baseUrl = '/api/vacaciones'; // ajusta a tu URL real

  constructor(private http: HttpClient) {}

  list(): Observable<Vacacion[]>                  { return this.http.get<Vacacion[]>(this.baseUrl); }
  get(id: number): Observable<Vacacion>           { return this.http.get<Vacacion>(`${this.baseUrl}/${id}`); }
  create(b: Partial<Vacacion>): Observable<Vacacion> { return this.http.post<Vacacion>(this.baseUrl, b); }
  update(id: number, b: Partial<Vacacion>): Observable<Vacacion> { 
    return this.http.put<Vacacion>(`${this.baseUrl}/${id}`, b); 
  }
  delete(id: number): Observable<void>            { return this.http.delete<void>(`${this.baseUrl}/${id}`); } // <-- agrega esto
}
