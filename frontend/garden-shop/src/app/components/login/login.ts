import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  nombre: string = '';
  password: string = '';
  cargando: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  iniciarSesion(): void {
    if (!this.nombre || !this.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor ingresa tu usuario y contraseña.',
        background: '#132b23',
        color: '#e8f5f0',
        confirmButtonColor: '#2d8c6e'
      });
      return;
    }

    this.cargando = true;

    this.authService.login(this.nombre, this.password).subscribe({
      next: (res) => {
        this.cargando = false;
        this.authService.guardarSesion(res);
        Swal.fire({
          icon: 'success',
          title: `¡Bienvenido, ${res.nombre}!`,
          timer: 1500,
          showConfirmButton: false,
          background: '#132b23',
          color: '#e8f5f0'
        }).then(() => {
          if (res.rol === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/catalogo']);
          }
        });
      },
      error: (err) => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al iniciar sesión',
          text: err.error?.mensaje || 'Credenciales incorrectas.',
          background: '#132b23',
          color: '#e8f5f0',
          confirmButtonColor: '#2d8c6e'
        });
      }
    });
  }
}