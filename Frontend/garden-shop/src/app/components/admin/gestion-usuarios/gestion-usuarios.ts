import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { SidebarComponent } from '../../shared/sidebar/sidebar';
import { HttpClient, HttpParams } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, FormsModule, CommonModule],
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.css'
})
export class GestionUsuariosComponent implements OnInit {

  usuarios: any[] = [];
  roles: any[] = [];
  cargando = false;
  busqueda = '';
  filtroActivo: number | null = null;
  filtroRol: number | null = null;
  actorEmail = '';

  modoFormulario: 'crear' | 'editar' | null = null;

  form = {
    idUsuario: 0,
    email: '',
    passHash: '',
    nombre: '',
    idRole: 1,
    activo: 1
  };

  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const sesion = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.actorEmail = sesion.email || '';
    this.cargarRoles();
    this.cargarUsuarios();
  }

  cargarRoles(): void {
    this.http.get(`${this.apiUrl}/roles/listar`).subscribe({
      next: (res: any) => this.roles = res,
      error: () => {}
    });
  }

  cargarUsuarios(): void {
    this.cargando = true;
    let params = new HttpParams();
    if (this.busqueda) params = params.set('busqueda', this.busqueda);
    if (this.filtroActivo !== null) params = params.set('activo', this.filtroActivo);
    if (this.filtroRol !== null) params = params.set('idRole', this.filtroRol);

    this.http.get(`${this.apiUrl}/usuarios/listar`, { params }).subscribe({
      next: (res: any) => { this.usuarios = res; this.cargando = false; },
      error: (err) => {
        this.cargando = false;
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || err.message,
          background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' });
      }
    });
  }

  abrirCrear(): void {
    this.modoFormulario = 'crear';
    this.form = { idUsuario: 0, email: '', passHash: '', nombre: '', idRole: 1, activo: 1 };
  }

  abrirEditar(u: any): void {
    this.modoFormulario = 'editar';
    this.form = {
      idUsuario: u.id_usuario,
      email: u.email,
      passHash: '',
      nombre: u.nombre,
      idRole: u.id_role,
      activo: u.activo
    };
  }

  cancelar(): void { this.modoFormulario = null; }

  guardar(): void {
    if (!this.form.email || !this.form.nombre) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos',
        text: 'Email y nombre son obligatorios.',
        background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' });
      return;
    }

    if (this.modoFormulario === 'crear') {
      if (!this.form.passHash) {
        Swal.fire({ icon: 'warning', title: 'Contraseña requerida',
          text: 'Ingresa una contraseña para el nuevo usuario.',
          background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' });
        return;
      }

      const body = {
        email: this.form.email,
        passHash: this.hashSHA256(this.form.passHash),
        nombre: this.form.nombre,
        idRole: this.form.idRole,
        actorEmail: this.actorEmail
      };

      this.http.post(`${this.apiUrl}/usuarios/crear`, body).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Usuario creado',
            timer: 1500, showConfirmButton: false, background: '#132b23', color: '#e8f5f0' });
          this.modoFormulario = null;
          this.cargarUsuarios();
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'Error',
          text: err.error?.mensaje || err.message,
          background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' })
      });
    } else {
      const body = {
        idUsuario: this.form.idUsuario,
        email: this.form.email,
        nombre: this.form.nombre,
        idRole: this.form.idRole,
        activo: this.form.activo,
        actorEmail: this.actorEmail
      };

      this.http.put(`${this.apiUrl}/usuarios/actualizar`, body).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Usuario actualizado',
            timer: 1500, showConfirmButton: false, background: '#132b23', color: '#e8f5f0' });
          this.modoFormulario = null;
          this.cargarUsuarios();
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'Error',
          text: err.error?.mensaje || err.message,
          background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' })
      });
    }
  }

  desactivar(u: any): void {
    Swal.fire({
      title: '¿Desactivar usuario?',
      text: `"${u.nombre}" no podrá iniciar sesión.`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#2d8c6e', cancelButtonColor: '#993c1d',
      confirmButtonText: 'Sí, desactivar',
      background: '#132b23', color: '#e8f5f0'
    }).then((result) => {
      if (result.isConfirmed) {
        let params = new HttpParams().set('actorEmail', this.actorEmail);
        this.http.put(`${this.apiUrl}/usuarios/desactivar/${u.id_usuario}`, null, { params }).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Usuario desactivado',
              timer: 1500, showConfirmButton: false, background: '#132b23', color: '#e8f5f0' });
            this.cargarUsuarios();
          },
          error: (err) => Swal.fire({ icon: 'error', title: 'Error',
            text: err.error?.mensaje || err.message,
            background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' })
        });
      }
    });
  }

  desbloquear(u: any): void {
    let params = new HttpParams().set('actorEmail', this.actorEmail);
    this.http.put(`${this.apiUrl}/usuarios/desbloquear/${u.id_usuario}`, null, { params }).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Usuario desbloqueado',
          timer: 1500, showConfirmButton: false, background: '#132b23', color: '#e8f5f0' });
        this.cargarUsuarios();
      },
      error: (err) => Swal.fire({ icon: 'error', title: 'Error',
        text: err.error?.mensaje || err.message,
        background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' })
    });
  }

  hashSHA256(password: string): string {
    return password;
  }
}