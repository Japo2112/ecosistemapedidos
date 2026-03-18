import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar';
import { SidebarComponent } from '../shared/sidebar/sidebar';
import { PedidosService } from '../../services/pedidos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent],
  templateUrl: './mis-pedidos.html',
  styleUrl: './mis-pedidos.css'
})
export class MisPedidosComponent implements OnInit {

  pedidos: any[] = [];
  cargando = false;
  actorEmail = '';
  idUsuario = 0;

  constructor(
    private pedidosService: PedidosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const sesion = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.actorEmail = sesion.email || '';
    this.idUsuario = sesion.id_usuario || 0;
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.cargando = true;
    this.pedidosService.listar(this.idUsuario).subscribe({
      next: (res) => { this.pedidos = res; this.cargando = false; },
      error: (err) => {
        this.cargando = false;
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || err.message,
          background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' });
      }
    });
  }

  verDetalle(pedido: any): void {
    this.router.navigate(['/mis-pedidos', pedido.id_pedido]);
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