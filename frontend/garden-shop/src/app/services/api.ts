import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://34.60.125.75:8000/api';

  constructor(private http: HttpClient) {}

  getProductos() {
  return this.http.get(`/api/productos/listar`);
}
}