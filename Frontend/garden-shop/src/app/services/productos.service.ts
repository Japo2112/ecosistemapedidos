import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private apiUrl = 'http://localhost:8000/api/productos';



  constructor(private http: HttpClient) {}

  listar(busqueda?: string, activo?: number, stockMin?: number, stockMax?: number): Observable<any> {
    let params = new HttpParams();
    if (busqueda) params = params.set('busqueda', busqueda);
    if (activo !== undefined) params = params.set('activo', activo);
    if (stockMin !== undefined) params = params.set('stockMin', stockMin);
    if (stockMax !== undefined) params = params.set('stockMax', stockMax);
    return this.http.get(`${this.apiUrl}/listar`, { params });
  }

  obtenerPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/obtener/${id}`);
  }

  crear(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, data);
  }

  actualizar(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar`, data);
  }

  eliminar(id: number, actorEmail: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`, {
      params: new HttpParams().set('actorEmail', actorEmail)
    });
  }

  activar(id: number, actorEmail: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/activar/${id}`, null, {
      params: new HttpParams().set('actorEmail', actorEmail)
    });
  }

  actualizarStock(id: number, stock: number, actorEmail: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/stock/${id}`, null, {
      params: new HttpParams().set('stock', stock).set('actorEmail', actorEmail)
    });
  }

  actualizarPrecio(id: number, precio: number, actorEmail: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/precio/${id}`, null, {
      params: new HttpParams().set('precio', precio).set('actorEmail', actorEmail)
    });
  }
}