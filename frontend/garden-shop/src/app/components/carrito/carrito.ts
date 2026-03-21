import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar';
import { SidebarComponent } from '../shared/sidebar/sidebar';
import { PedidosService } from '../../services/pedidos.service';
import { PedidoDetalleService } from '../../services/pedido-detalle.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, FormsModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class CarritoComponent implements OnInit {

  pedidos: any[] = [];
  pedidoActivo: any = null;
  detalle: any[] = [];
  cargando = false;
  actorEmail = '';
  idUsuario = 0;

  constructor(
    private pedidosService: PedidosService,
    private detalleService: PedidoDetalleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const sesion = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.actorEmail = sesion.email || '';
    this.idUsuario = sesion.id_Usuario || 0;
    this.cargarPedidoActivo();
  }

  cargarPedidoActivo(): void {
    this.cargando = true;
    this.pedidosService.listar(this.idUsuario, 'CREADO').subscribe({
      next: (res: any[]) => {
        this.cargando = false;
        if (res && res.length > 0) {
          this.pedidoActivo = res[0];
          this.cargarDetalle();
        } else {
          this.pedidoActivo = null;
          this.detalle = [];
        }
      },
      error: (err) => {
        this.cargando = false;
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || err.message,
          background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' });
      }
    });
  }

  cargarDetalle(): void {
    if (!this.pedidoActivo) return;
    this.detalleService.listar(this.pedidoActivo.id_Pedido).subscribe({
      next: (res) => this.detalle = res,
      error: () => {}
    });
  }

  actualizarCantidad(item: any, nuevaCantidad: number): void {
    if (nuevaCantidad <= 0) {
      this.eliminarItem(item);
      return;
    }
    this.detalleService.actualizar(item.id_Detalle, nuevaCantidad, this.actorEmail).subscribe({
      next: () => this.cargarPedidoActivo(),
      error: (err) => Swal.fire({ icon: 'error', title: 'Error',
        text: err.error?.mensaje || err.message,
        background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' })
    });
  }

  eliminarItem(item: any): void {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: `Se quitará "${item.producto}" del carrito.`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#993c1d', cancelButtonColor: '#5f5e5a',
      confirmButtonText: 'Sí, eliminar', background: '#132b23', color: '#e8f5f0'
    }).then((result) => {
      if (result.isConfirmed) {
        this.detalleService.eliminar(item.id_Detalle, this.actorEmail).subscribe({
          next: () => this.cargarPedidoActivo(),
          error: (err) => Swal.fire({ icon: 'error', title: 'Error',
            text: err.error?.mensaje || err.message,
            background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' })
        });
      }
    });
  }

  confirmarPedido(): void {
    Swal.fire({
      title: '¿Confirmar pedido?',
      text: 'Se procesará el pago y se descontará el stock.',
      icon: 'question', showCancelButton: true,
      confirmButtonColor: '#2d8c6e', cancelButtonColor: '#5f5e5a',
      confirmButtonText: 'Sí, confirmar', background: '#132b23', color: '#e8f5f0'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pedidosService.confirmarTransaccion(this.pedidoActivo.id_Pedido, this.actorEmail).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: '¡Pedido confirmado!',
              text: 'Tu pedido ha sido procesado correctamente.',
              background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e'
            }).then(() => this.router.navigate(['/mis-pedidos']));
          },
          error: (err) => Swal.fire({ icon: 'error', title: 'Error',
            text: err.error?.mensaje || err.message,
            background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' })
        });
      }
    });
  }

  cancelarPedido(): void {
    Swal.fire({
      title: '¿Cancelar pedido?',
      text: 'Se cancelará todo el pedido.',
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#993c1d', cancelButtonColor: '#5f5e5a',
      confirmButtonText: 'Sí, cancelar', background: '#132b23', color: '#e8f5f0'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pedidosService.cancelar(this.pedidoActivo.id_Pedido, this.actorEmail).subscribe({
          next: () => {
            this.pedidoActivo = null;
            this.detalle = [];
            Swal.fire({ icon: 'success', title: 'Pedido cancelado',
              timer: 1500, showConfirmButton: false,
              background: '#132b23', color: '#e8f5f0' });
          },
          error: (err) => Swal.fire({ icon: 'error', title: 'Error',
            text: err.error?.mensaje || err.message,
            background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' })
        });
      }
    });
  }
}