import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:5229/api';

  constructor(private http: HttpClient) {}

  login(nombre: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { nombre, password });
  }

  guardarSesion(data: any): void {
    localStorage.setItem('usuario', JSON.stringify(data));
  }

  obtenerSesion(): any {
    const data = localStorage.getItem('usuario');
    return data ? JSON.parse(data) : null;
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuario');
  }

  estaLogueado(): boolean {
    return this.obtenerSesion() !== null;
  }

  esAdmin(): boolean {
    const sesion = this.obtenerSesion();
    return sesion?.rol === 'ADMIN';
  }

  obtenerEmail(): string {
    return this.obtenerSesion()?.email ?? '';
  }

  obtenerNombre(): string {
    return this.obtenerSesion()?.nombre ?? '';
  }
}