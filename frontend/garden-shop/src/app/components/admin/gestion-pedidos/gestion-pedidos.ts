import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { SidebarComponent } from '../../shared/sidebar/sidebar';
import { PedidosService } from '../../../services/pedidos.service';
import { PedidoDetalleService } from '../../../services/pedido-detalle.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-pedidos',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, FormsModule],
  templateUrl: './gestion-pedidos.html',
  styleUrl: './gestion-pedidos.css'
})
export class GestionPedidosComponent implements OnInit {

  pedidos: any[] = [];
  detallePedido: any[] = [];
  pedidoSeleccionado: any = null;
  cargando = false;
  cargandoDetalle = false;
  actorEmail = '';

  filtro = {
    estado: '',
    fechaInicio: '',
    fechaFin: ''
  };

  constructor(
    private pedidosService: PedidosService,
    private detalleService: PedidoDetalleService
  ) {}

  ngOnInit(): void {
    const sesion = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.actorEmail = sesion.email || '';
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.cargando = true;
    this.pedidosService.listar(
      undefined,
      this.filtro.estado || undefined,
      this.filtro.fechaInicio || undefined,
      this.filtro.fechaFin || undefined
    ).subscribe({
      next: (res) => { this.pedidos = res; this.cargando = false; },
      error: (err) => {
        this.cargando = false;
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || err.message,
          background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' });
      }
    });
  }

  verDetalle(p: any): void {
    this.pedidoSeleccionado = p;
    this.cargandoDetalle = true;
    this.detalleService.listar(p.id_Pedido).subscribe({
      next: (res) => { this.detallePedido = res; this.cargandoDetalle = false; },
      error: (err) => {
        this.cargandoDetalle = false;
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || err.message,
          background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' });
      }
    });
  }

  cerrarDetalle(): void {
    this.pedidoSeleccionado = null;
    this.detallePedido = [];
  }

  confirmar(p: any): void {
    Swal.fire({
      title: '¿Confirmar pedido?',
      text: `Se confirmará el pedido #${p.id_Pedido} y se descontará el stock.`,
      icon: 'question', showCancelButton: true,
      confirmButtonColor: '#2d8c6e', cancelButtonColor: '#993c1d',
      confirmButtonText: 'Sí, confirmar', background: '#132b23', color: '#e8f5f0'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pedidosService.confirmarTransaccion(p.id_Pedido, this.actorEmail).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Pedido confirmado',
              timer: 1500, showConfirmButton: false, background: '#132b23', color: '#e8f5f0' });
            this.cargarPedidos();
            this.cerrarDetalle();
          },
          error: (err) => Swal.fire({ icon: 'error', title: 'Error',
            text: err.error?.mensaje || err.message,
            background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' })
        });
      }
    });
  }

  cancelar(p: any): void {
    Swal.fire({
      title: '¿Cancelar pedido?',
      text: `Se cancelará el pedido #${p.id_Pedido}.`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#993c1d', cancelButtonColor: '#5f5e5a',
      confirmButtonText: 'Sí, cancelar', background: '#132b23', color: '#e8f5f0'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pedidosService.cancelar(p.id_Pedido, this.actorEmail).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Pedido cancelado',
              timer: 1500, showConfirmButton: false, background: '#132b23', color: '#e8f5f0' });
            this.cargarPedidos();
            this.cerrarDetalle();
          },
          error: (err) => Swal.fire({ icon: 'error', title: 'Error',
            text: err.error?.mensaje || err.message,
            background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' })
        });
      }
    });
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'CREADO': return 'bg-warning text-dark';
      case 'PAGADO': return 'bg-success';
      case 'ENVIADO': return 'bg-info text-dark';
      case 'CANCELADO': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}