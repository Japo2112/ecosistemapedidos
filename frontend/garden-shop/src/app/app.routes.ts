import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { CatalogoComponent } from './components/catalogo/catalogo';
import { CarritoComponent } from './components/carrito/carrito';
import { MisPedidosComponent } from './components/mis-pedidos/mis-pedidos';
import { DetallePedidoComponent } from './components/detalle-pedido/detalle-pedido';
import { DashboardComponent } from './components/admin/dashboard/dashboard';
import { GestionProductosComponent } from './components/admin/gestion-productos/gestion-productos';
import { GestionUsuariosComponent } from './components/admin/gestion-usuarios/gestion-usuarios';
import { GestionRolesComponent } from './components/admin/gestion-roles/gestion-roles';
import { GestionPedidosComponent } from './components/admin/gestion-pedidos/gestion-pedidos';
import { AuditLogComponent } from './components/admin/audit-log/audit-log';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  { path: 'catalogo', component: CatalogoComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'mis-pedidos', component: MisPedidosComponent },
  { path: 'mis-pedidos/:id', component: DetallePedidoComponent },

  { path: 'admin/dashboard', component: DashboardComponent },
  { path: 'admin/productos', component: GestionProductosComponent },
  { path: 'admin/usuarios', component: GestionUsuariosComponent },
  { path: 'admin/roles', component: GestionRolesComponent },
  { path: 'admin/pedidos', component: GestionPedidosComponent },
  { path: 'admin/auditlog', component: AuditLogComponent },

  { path: '**', redirectTo: 'login' }
];