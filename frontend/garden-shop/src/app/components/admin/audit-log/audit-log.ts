import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { SidebarComponent } from '../../shared/sidebar/sidebar';
import { HttpClient, HttpParams } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, FormsModule],
  templateUrl: './audit-log.html',
  styleUrl: './audit-log.css'
})
export class AuditLogComponent implements OnInit {

  logs: any[] = [];
  cargando = false;

  filtro = {
    evento: '',
    actorEmail: '',
    entidad: '',
    fechaInicio: '',
    fechaFin: ''
  };

  private apiUrl = 'http://localhost:5229/api/auditlog';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarLogs();
  }

  cargarLogs(): void {
    this.cargando = true;
    let params = new HttpParams();
    if (this.filtro.evento) params = params.set('evento', this.filtro.evento);
    if (this.filtro.actorEmail) params = params.set('actorEmail', this.filtro.actorEmail);
    if (this.filtro.entidad) params = params.set('entidad', this.filtro.entidad);
    if (this.filtro.fechaInicio) params = params.set('fechaInicio', this.filtro.fechaInicio);
    if (this.filtro.fechaFin) params = params.set('fechaFin', this.filtro.fechaFin);

    this.http.get(`${this.apiUrl}/listar`, { params }).subscribe({
      next: (res: any) => { this.logs = res; this.cargando = false; },
      error: (err) => {
        this.cargando = false;
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || err.message,
          background: '#132b23', color: '#e8f5f0', confirmButtonColor: '#2d8c6e' });
      }
    });
  }

  limpiarFiltros(): void {
    this.filtro = { evento: '', actorEmail: '', entidad: '', fechaInicio: '', fechaFin: '' };
    this.cargarLogs();
  }

  verDetalle(log: any): void {
    Swal.fire({
      title: `Evento: ${log.evento}`,
      html: `
        <div style="text-align:left; font-size:13px;">
          <p><b>Actor:</b> ${log.actor_Email || '—'}</p>
          <p><b>IP:</b> ${log.ip_Origen || '—'}</p>
          <p><b>Entidad:</b> ${log.entidad || '—'} #${log.entidad_Id || '—'}</p>
          <p><b>Fecha:</b> ${log.creado_En}</p>
          <p><b>Detalle:</b></p>
          <pre style="background:#0d1f1a; padding:8px; border-radius:6px; color:#00c9b1; font-size:12px; overflow:auto;">${JSON.stringify(JSON.parse(log.detalle || '{}'), null, 2)}</pre>
        </div>
      `,
      background: '#132b23',
      color: '#e8f5f0',
      confirmButtonColor: '#2d8c6e',
      width: '600px'
    });
  }
}