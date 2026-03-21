import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  // ✅ URL relativa — Nginx hace el proxy hacia el backend en :8000
  private apiUrl = '/api/pedidos';

  constructor(private http: HttpClient) {}

  listar(idUsuario?: number, estado?: string, fechaInicio?: string, fechaFin?: string): Observable<any> {
    let params = new HttpParams();
    if (idUsuario) params = params.set('idUsuario', idUsuario);
    if (estado) params = params.set('estado', estado);
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get(`${this.apiUrl}/listar`, { params });
  }

  obtenerPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/obtener/${id}`);
  }

  crear(idUsuario: number, actorEmail: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, { idUsuario, actorEmail });
  }

  confirmarTransaccion(id: number, actorEmail: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/confirmar-transaccion/${id}`, null, {
      params: new HttpParams().set('actorEmail', actorEmail)
    });
  }

  cancelar(id: number, actorEmail: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/cancelar/${id}`, null, {
      params: new HttpParams().set('actorEmail', actorEmail)
    });
  }

  eliminar(id: number, actorEmail: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`, {
      params: new HttpParams().set('actorEmail', actorEmail)
    });
  }

  factura(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/factura/${id}`);
  }
}
