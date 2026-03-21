import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // ✅ Sin IP hardcodeada — Nginx hace el proxy hacia el backend
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  getProductos() {
    return this.http.get(`${this.baseUrl}/productos/listar`);
  }
}
