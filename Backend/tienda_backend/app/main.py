from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, usuarios, roles, productos, pedidos, pedido_detalle, audit_log

app = FastAPI(title="Tienda Virtual API", version="1.0.0")

# CORS — permite que el frontend Angular consuma la API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción cambiar por el dominio real
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar todos los routers
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(roles.router)
app.include_router(productos.router)
app.include_router(pedidos.router)
app.include_router(pedido_detalle.router)
app.include_router(audit_log.router)


@app.get("/")
def root():
    return {"mensaje": "Tienda Virtual API corriendo correctamente"}
