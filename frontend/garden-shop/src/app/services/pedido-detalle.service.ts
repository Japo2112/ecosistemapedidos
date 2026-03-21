import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidoDetalleService {

  private apiUrl = 'http://localhost:5229/api/pedido-detalle';

  constructor(private http: HttpClient) {}

  listar(idPedido: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/listar/${idPedido}`);
  }

  agregar(idPedido: number, idProducto: number, cantidad: number, actorEmail: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/agregar`, { idPedido, idProducto, cantidad, actorEmail });
  }

  actualizar(idDetalle: number, cantidad: number, actorEmail: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar`, { idDetalle, cantidad, actorEmail });
  }

  eliminar(idDetalle: number, actorEmail: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${idDetalle}`, {
      params: new HttpParams().set('actorEmail', actorEmail)
    });
  }
}