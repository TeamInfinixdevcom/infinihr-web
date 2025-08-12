import { HttpClient } from '@angular/common/http';
export abstract class BaseCrudService<T> {
  protected constructor(protected http: HttpClient, private baseUrl: string) {}
  list(){ return this.http.get<T[]>(this.baseUrl); }
  get(id:number){ return this.http.get<T>(`${this.baseUrl}/${id}`); }
  create(body:T){ return this.http.post<T>(this.baseUrl, body); }
  update(id:number, body:Partial<T>){ return this.http.put<T>(`${this.baseUrl}/${id}`, body); }
  delete(id:number){ return this.http.delete(`${this.baseUrl}/${id}`); }
}
