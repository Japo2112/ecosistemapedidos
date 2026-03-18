import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../shared/navbar/navbar';
import { SidebarComponent } from '../shared/sidebar/sidebar';
import { ProductosService } from '../../services/productos.service';
import { PedidosService } from '../../services/pedidos.service';
import { PedidoDetalleService } from '../../services/pedido-detalle.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, FormsModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class CatalogoComponent implements OnInit {

  productos: any[] = [];
  cargando = false;
  busqueda = '';
  actorEmail = '';
  idUsuario = 0;
  pedidoActivo: any = null;

  constructor(
    private productosService: ProductosService,
    private pedidosService: PedidosService,
    private detalleService: PedidoDetalleService
  ) {}

  ngOnInit(): void {
    const sesion = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.actorEmail = sesion.email || '';
    this.idUsuario = sesion.id_usuario || 0;
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.productosService.listar(this.busqueda, 1).subscribe({
      next: (res) => { this.productos = res; this.cargando = false; },
      error: (err) => {
        this.cargando = false;
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || err.message,
          background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' });
      }
    });
  }

  agregarAlCarrito(producto: any): void {
    const agregarDetalle = (idPedido: number) => {
      this.detalleService.agregar(idPedido, producto.id_producto, 1, this.actorEmail).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: '¡Agregado!',
            text: `${producto.nombre} agregado al carrito.`,
            timer: 1500, showConfirmButton: false,
            background: '#132b23', color: '#e8f5f0' });
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'Error',
          text: err.error?.mensaje || err.message,
          background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' })
      });
    };

    if (this.pedidoActivo) {
      agregarDetalle(this.pedidoActivo.id_pedido);
    } else {
      this.pedidosService.crear(this.idUsuario, this.actorEmail).subscribe({
        next: (res) => {
          this.pedidoActivo = res;
          agregarDetalle(res.id_pedido);
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'Error',
          text: err.error?.mensaje || err.message,
          background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' })
      });
    }
  }
}