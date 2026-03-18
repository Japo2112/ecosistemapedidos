import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { SidebarComponent } from '../../shared/sidebar/sidebar';
import { ProductosService } from '../../../services/productos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, FormsModule, DecimalPipe],
  templateUrl: './gestion-productos.html',
  styleUrl: './gestion-productos.css'
})
export class GestionProductosComponent implements OnInit {
  productos: any[] = [];
  cargando = false;
  busqueda = '';
  filtroActivo: number | null = null;

  modoFormulario: 'crear' | 'editar' | null = null;
  productoSeleccionado: any = null;

  form = {
    idProducto: 0,
    sku: '',
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    activo: 1
  };

  actorEmail = '';

  constructor(private productosService: ProductosService) {}

  ngOnInit(): void {
    const sesion = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.actorEmail = sesion.email || '';
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.productosService.listar(this.busqueda, this.filtroActivo ?? undefined).subscribe({
      next: (res) => {
        this.productos = res;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || err.message,
          background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' });
      }
    });
  }

  abrirCrear(): void {
    this.modoFormulario = 'crear';
    this.form = { idProducto: 0, sku: '', nombre: '', descripcion: '', precio: 0, stock: 0, activo: 1 };
  }

  abrirEditar(p: any): void {
    this.modoFormulario = 'editar';
    this.form = {
      idProducto: p.id_producto,
      sku: p.sku,
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio: p.precio,
      stock: p.stock,
      activo: p.activo
    };
  }

  cancelar(): void {
    this.modoFormulario = null;
  }

  guardar(): void {
    if (!this.form.sku || !this.form.nombre || this.form.precio < 0) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos',
        text: 'SKU, nombre y precio son obligatorios.',
        background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' });
      return;
    }

    const request = this.modoFormulario === 'crear'
      ? this.productosService.crear({ ...this.form, actorEmail: this.actorEmail })
      : this.productosService.actualizar({ ...this.form, actorEmail: this.actorEmail });

    request.subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: this.modoFormulario === 'crear' ? 'Producto creado' : 'Producto actualizado',
          timer: 1500, showConfirmButton: false, background: '#132b23', color: '#e8f5f0' });
        this.modoFormulario = null;
        this.cargarProductos();
      },
      error: (err) => {
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || err.message,
          background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' });
      }
    });
  }

  eliminar(p: any): void {
    Swal.fire({
      title: '¿Desactivar producto?',
      text: `"${p.nombre}" quedará inactivo.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2d8c6e',
      cancelButtonColor: '#993c1d',
      confirmButtonText: 'Sí, desactivar',
      background: '#132b23',
      color: '#e8f5f0'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productosService.eliminar(p.id_producto, this.actorEmail).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Producto desactivado',
              timer: 1500, showConfirmButton: false, background: '#132b23', color: '#e8f5f0' });
            this.cargarProductos();
          },
          error: (err) => {
            Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || err.message,
              background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' });
          }
        });
      }
    });
  }

  activar(p: any): void {
    this.productosService.activar(p.id_producto, this.actorEmail).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Producto activado',
          timer: 1500, showConfirmButton: false, background: '#132b23', color: '#e8f5f0' });
        this.cargarProductos();
      },
      error: (err) => {
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || err.message,
          background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' });
      }
    });
  }
}