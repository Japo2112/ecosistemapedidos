# Tienda Virtual — Backend Python (FastAPI)

## Estructura del proyecto

```
tienda_backend/
├── app/
│   ├── main.py                  # Punto de entrada FastAPI
│   ├── config.py                # Configuración y conexión BD
│   ├── routers/
│   │   ├── auth.py              # POST /api/auth/login
│   │   ├── usuarios.py          # CRUD /api/usuarios
│   │   ├── roles.py             # CRUD /api/roles
│   │   ├── productos.py         # CRUD /api/productos
│   │   ├── pedidos.py           # CRUD /api/pedidos + factura
│   │   ├── pedido_detalle.py    # CRUD /api/pedido-detalle
│   │   └── audit_log.py         # GET  /api/audit-log/listar
│   └── services/
│       ├── audit.py             # Registro de auditoría
│       ├── email_service.py     # Envío de correos SMTP
│       └── sftp_service.py      # Generación PDF + subida SFTP
├── .env                         # Variables de entorno
├── requirements.txt
├── install.sh                   # Instalación automática
└── run.sh                       # Inicio con Gunicorn
```

---

## 1. Instalación

```bash
# Clonar o copiar el proyecto en el servidor
cd /opt/tienda_backend

# Dar permisos y ejecutar instalador
chmod +x install.sh run.sh
bash install.sh
```

---

## 2. Configurar .env

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_PASSWORD
DB_NAME=TiendaVirtual

SMTP_HOST=127.0.0.1
SMTP_PORT=25
SMTP_FROM=no-reply@grupoX.os

SFTP_HOST=127.0.0.1
SFTP_PORT=22
SFTP_USER=sftpuser
SFTP_PASS=TU_PASSWORD_SFTP
SFTP_REMOTE_DIR=/home/sftpuser/facturas
```

---

## 3. Iniciar el servidor

```bash
bash run.sh
# Corre en http://0.0.0.0:8000
```

Para desarrollo con recarga automática:
```bash
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

---

## 4. Configurar Nginx como Reverse Proxy

```nginx
server {
    listen 80;
    server_name tienda.grupoX.os;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name tienda.grupoX.os;

    ssl_certificate     /etc/ssl/certs/grupoX.crt;
    ssl_certificate_key /etc/ssl/private/grupoX.key;

    # Frontend Angular (build)
    location / {
        root /var/www/tienda/dist/tienda/browser;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 5. Endpoints disponibles

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Iniciar sesión |

### Usuarios
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/usuarios/listar | Listar usuarios |
| POST | /api/usuarios/crear | Crear usuario |
| PUT | /api/usuarios/actualizar | Actualizar usuario |
| PUT | /api/usuarios/desactivar/{id} | Desactivar usuario |
| PUT | /api/usuarios/desbloquear/{id} | Desbloquear usuario |

### Roles
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/roles/listar | Listar roles |
| POST | /api/roles/crear | Crear rol |
| PUT | /api/roles/actualizar | Actualizar rol |
| DELETE | /api/roles/eliminar/{id} | Eliminar rol |

### Productos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/productos/listar | Listar productos |
| GET | /api/productos/obtener/{id} | Obtener por ID |
| POST | /api/productos/crear | Crear producto |
| PUT | /api/productos/actualizar | Actualizar producto |
| DELETE | /api/productos/eliminar/{id} | Desactivar producto |
| PUT | /api/productos/activar/{id} | Activar producto |
| PUT | /api/productos/stock/{id} | Ajustar stock |
| PUT | /api/productos/precio/{id} | Cambiar precio |

### Pedidos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/pedidos/listar | Listar pedidos |
| GET | /api/pedidos/obtener/{id} | Obtener pedido |
| POST | /api/pedidos/crear | Crear pedido |
| PUT | /api/pedidos/confirmar-transaccion/{id} | Pagar (envía correo + sube factura SFTP) |
| PUT | /api/pedidos/cancelar/{id} | Cancelar pedido |
| DELETE | /api/pedidos/eliminar/{id} | Eliminar pedido |
| GET | /api/pedidos/factura/{id} | Descargar factura PDF |

### Pedido Detalle
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/pedido-detalle/listar/{idPedido} | Listar detalles |
| POST | /api/pedido-detalle/agregar | Agregar producto |
| PUT | /api/pedido-detalle/actualizar | Actualizar cantidad |
| DELETE | /api/pedido-detalle/eliminar/{id} | Eliminar línea |

### Audit Log
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/audit-log/listar | Ver registros de auditoría |

---

## 6. Cambiar URL del frontend

En el frontend Angular, cambia la URL base de `http://localhost:5229` a `https://tienda.grupoX.os`:

```typescript
// En cada service cambiar:
private apiUrl = 'http://localhost:5229/api';
// Por:
private apiUrl = 'https://tienda.grupoX.os/api';
```

---

## 7. Documentación automática

Con el servidor corriendo visita:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc:      `http://localhost:8000/redoc`
