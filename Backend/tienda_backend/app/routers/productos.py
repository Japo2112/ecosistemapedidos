from fastapi import APIRouter, Request, Query
from pydantic import BaseModel
from typing import Optional
from app.config import get_db
from app.services import audit

router = APIRouter(prefix="/api/productos", tags=["Productos"])


class ProductoCrear(BaseModel):
    sku: str
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    stock: int
    activo: int = 1
    actorEmail: str


class ProductoActualizar(BaseModel):
    idProducto: int
    sku: str
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    stock: int
    activo: int
    actorEmail: str


@router.get("/listar")
def listar(busqueda: Optional[str] = None, activo: Optional[int] = None,
           stockMin: Optional[int] = None, stockMax: Optional[int] = None):
    db = get_db()
    try:
        sql = "SELECT * FROM productos WHERE 1=1"
        params = []
        if busqueda:
            sql += " AND (nombre LIKE %s OR sku LIKE %s)"
            params += [f"%{busqueda}%", f"%{busqueda}%"]
        if activo is not None:
            sql += " AND activo = %s"
            params.append(activo)
        if stockMin is not None:
            sql += " AND stock >= %s"
            params.append(stockMin)
        if stockMax is not None:
            sql += " AND stock <= %s"
            params.append(stockMax)
        with db.cursor() as cur:
            cur.execute(sql, params)
            return cur.fetchall()
    finally:
        db.close()


@router.get("/obtener/{id_producto}")
def obtener(id_producto: int):
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute("SELECT * FROM productos WHERE id_producto=%s", (id_producto,))
            return cur.fetchone()
    finally:
        db.close()


@router.post("/crear")
def crear(body: ProductoCrear, request: Request):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            cur.execute(
                "INSERT INTO productos (sku, nombre, descripcion, precio, stock, activo) "
                "VALUES (%s,%s,%s,%s,%s,%s)",
                (body.sku, body.nombre, body.descripcion, body.precio, body.stock, body.activo)
            )
            new_id = cur.lastrowid
        db.commit()
        audit.registrar("PRODUCTO_CREAR", body.actorEmail, ip, "productos", new_id,
                        {"sku": body.sku, "nombre": body.nombre, "precio": body.precio,
                         "stock": body.stock, "activo": body.activo})
        return {"ok": True, "id_producto": new_id}
    finally:
        db.close()


@router.put("/actualizar")
def actualizar(body: ProductoActualizar, request: Request):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            cur.execute(
                "UPDATE productos SET sku=%s, nombre=%s, descripcion=%s, precio=%s, "
                "stock=%s, activo=%s WHERE id_producto=%s",
                (body.sku, body.nombre, body.descripcion, body.precio,
                 body.stock, body.activo, body.idProducto)
            )
        db.commit()
        audit.registrar("PRODUCTO_ACTUALIZAR", body.actorEmail, ip, "productos", body.idProducto,
                        {"sku": body.sku, "nombre": body.nombre, "precio": body.precio})
        return {"ok": True}
    finally:
        db.close()


@router.delete("/eliminar/{id_producto}")
def eliminar(id_producto: int, request: Request, actorEmail: str = Query(...)):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            cur.execute("UPDATE productos SET activo=0 WHERE id_producto=%s", (id_producto,))
        db.commit()
        audit.registrar("PRODUCTO_ELIMINAR", actorEmail, ip, "productos", id_producto, {})
        return {"ok": True}
    finally:
        db.close()


@router.put("/activar/{id_producto}")
def activar(id_producto: int, request: Request, actorEmail: str = Query(...)):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            cur.execute("UPDATE productos SET activo=1 WHERE id_producto=%s", (id_producto,))
        db.commit()
        audit.registrar("PRODUCTO_ACTIVAR", actorEmail, ip, "productos", id_producto, {})
        return {"ok": True}
    finally:
        db.close()


@router.put("/stock/{id_producto}")
def actualizar_stock(id_producto: int, request: Request,
                     stock: int = Query(...), actorEmail: str = Query(...)):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            cur.execute("UPDATE productos SET stock=%s WHERE id_producto=%s", (stock, id_producto))
        db.commit()
        audit.registrar("PRODUCTO_STOCK", actorEmail, ip, "productos", id_producto, {"stock": stock})
        return {"ok": True}
    finally:
        db.close()


@router.put("/precio/{id_producto}")
def actualizar_precio(id_producto: int, request: Request,
                      precio: float = Query(...), actorEmail: str = Query(...)):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            cur.execute("UPDATE productos SET precio=%s WHERE id_producto=%s", (precio, id_producto))
        db.commit()
        audit.registrar("PRODUCTO_PRECIO", actorEmail, ip, "productos", id_producto, {"precio": precio})
        return {"ok": True}
    finally:
        db.close()
