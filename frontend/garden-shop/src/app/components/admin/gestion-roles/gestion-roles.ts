import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { SidebarComponent } from '../../shared/sidebar/sidebar';
import { HttpClient, HttpParams } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-roles',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, FormsModule],
  templateUrl: './gestion-roles.html',
  styleUrl: './gestion-roles.css'
})
export class GestionRolesComponent implements OnInit {

  roles: any[] = [];
  cargando = false;
  actorEmail = '';
  modoFormulario: 'crear' | 'editar' | null = null;

  form = { idRole: 0, nombre: '' };

  private apiUrl = 'http://localhost:5229/api/roles';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const sesion = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.actorEmail = sesion.email || '';
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.cargando = true;
    this.http.get(`${this.apiUrl}/listar`).subscribe({
      next: (res: any) => { this.roles = res; this.cargando = false; },
      error: (err) => {
        this.cargando = false;
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || err.message,
          background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' });
      }
    });
  }

  abrirCrear(): void {
    this.modoFormulario = 'crear';
    this.form = { idRole: 0, nombre: '' };
  }

  abrirEditar(r: any): void {
    this.modoFormulario = 'editar';
    this.form = { idRole: r.id_Role, nombre: r.nombre };
  }

  cancelar(): void { this.modoFormulario = null; }

  guardar(): void {
    if (!this.form.nombre) {
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'El nombre del rol es obligatorio.',
        background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' });
      return;
    }

    const obs = this.modoFormulario === 'crear'
      ? this.http.post(`${this.apiUrl}/crear`, { nombre: this.form.nombre, actorEmail: this.actorEmail })
      : this.http.put(`${this.apiUrl}/actualizar`, { idRole: this.form.idRole, nombre: this.form.nombre, actorEmail: this.actorEmail });

    obs.subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: this.modoFormulario === 'crear' ? 'Rol creado' : 'Rol actualizado',
          timer: 1500, showConfirmButton: false, background: '#132b23', color: '#e8f5f0' });
        this.modoFormulario = null;
        this.cargarRoles();
      },
      error: (err) => Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || err.message,
        background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' })
    });
  }

  eliminar(r: any): void {
    Swal.fire({
      title: '¿Eliminar rol?', text: `Se eliminará el rol "${r.nombre}".`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#2d8c6e', cancelButtonColor: '#993c1d',
      confirmButtonText: 'Sí, eliminar', background: '#132b23', color: '#e8f5f0'
    }).then((result) => {
      if (result.isConfirmed) {
        let params = new HttpParams().set('actorEmail', this.actorEmail);
        this.http.delete(`${this.apiUrl}/eliminar/${r.id_Role}`, { params }).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Rol eliminado',
              timer: 1500, showConfirmButton: false, background: '#132b23', color: '#e8f5f0' });
            this.cargarRoles();
          },
          error: (err) => Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || err.message,
            background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' })
        });
      }
    });
  }
}