import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar';
import { SidebarComponent } from '../shared/sidebar/sidebar';
import { PedidosService } from '../../services/pedidos.service';
import { PedidoDetalleService } from '../../services/pedido-detalle.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-pedido',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent],
  templateUrl: './detalle-pedido.html',
  styleUrl: './detalle-pedido.css'
})
export class DetallePedidoComponent implements OnInit {

  pedido: any = null;
  detalle: any[] = [];
  cargando = false;
  actorEmail = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidosService: PedidosService,
    private detalleService: PedidoDetalleService
  ) {}

  ngOnInit(): void {
    const sesion = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.actorEmail = sesion.email || '';
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarPedido(id);
  }

  cargarPedido(id: number): void {
    this.cargando = true;
    this.pedidosService.obtenerPorId(id).subscribe({
      next: (res) => {
        this.pedido = res;
        this.detalleService.listar(id).subscribe({
          next: (det) => { this.detalle = det; this.cargando = false; },
          error: () => this.cargando = false
        });
      },
      error: (err) => {
        this.cargando = false;
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || err.message,
          background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e'
        }).then(() => this.router.navigate(['/mis-pedidos']));
      }
    });
  }

  descargarFactura(): void {
    this.pedidosService.factura(this.pedido.id_Pedido).subscribe({
      next: (res: any) => {
        let contenido = `FACTURA - GARDENSHOP\n`;
        contenido += `====================\n`;
        contenido += `Pedido #${this.pedido.id_Pedido}\n`;
        contenido += `Cliente: ${this.pedido.nombre}\n`;
        contenido += `Email: ${this.pedido.email}\n`;
        contenido += `Fecha: ${this.pedido.creado_En}\n`;
        contenido += `Estado: ${this.pedido.estado}\n\n`;
        contenido += `DETALLE:\n`;
        contenido += `--------\n`;
        res.forEach((item: any) => {
          contenido += `${item.producto} x${item.cantidad} @ Q${item.precio_Unit} = Q${item.subtotal}\n`;
        });
        contenido += `--------\n`;
        contenido += `TOTAL: Q${this.pedido.total}\n`;

        const blob = new Blob([contenido], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura_pedido_${this.pedido.id_Pedido}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => Swal.fire({ icon: 'error', title: 'Error',
        text: err.error?.mensaje || err.message,
        background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' })
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

  volver(): void {
    this.router.navigate(['/mis-pedidos']);
  }
}