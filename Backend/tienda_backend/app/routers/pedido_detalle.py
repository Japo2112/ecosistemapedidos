from fastapi import APIRouter, Request, Query
from pydantic import BaseModel
from app.config import get_db
from app.services import audit

router = APIRouter(prefix="/api/pedido-detalle", tags=["Pedido Detalle"])


class DetalleAgregar(BaseModel):
    idPedido: int
    idProducto: int
    cantidad: int
    actorEmail: str


class DetalleActualizar(BaseModel):
    idDetalle: int
    cantidad: int
    actorEmail: str


@router.get("/listar/{id_pedido}")
def listar(id_pedido: int):
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                "SELECT pd.*, p.nombre AS nombre_producto, p.sku, p.precio "
                "FROM pedido_detalle pd "
                "JOIN productos p ON pd.id_producto = p.id_producto "
                "WHERE pd.id_pedido = %s",
                (id_pedido,)
            )
            return cur.fetchall()
    finally:
        db.close()


@router.post("/agregar")
def agregar(body: DetalleAgregar, request: Request):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            # Obtener precio actual del producto
            cur.execute("SELECT precio FROM productos WHERE id_producto=%s", (body.idProducto,))
            prod = cur.fetchone()
            if not prod:
                return {"ok": False, "mensaje": "Producto no encontrado"}

            precio_unit = float(prod["precio"])
            subtotal = precio_unit * body.cantidad

            # Insertar o actualizar si ya existe
            cur.execute(
                "INSERT INTO pedido_detalle (id_pedido, id_producto, cantidad, precio_unit, subtotal) "
                "VALUES (%s,%s,%s,%s,%s) "
                "ON DUPLICATE KEY UPDATE cantidad=cantidad+%s, subtotal=subtotal+%s",
                (body.idPedido, body.idProducto, body.cantidad, precio_unit, subtotal,
                 body.cantidad, subtotal)
            )
            new_id = cur.lastrowid

            # Recalcular total del pedido
            cur.execute(
                "UPDATE pedidos SET total=(SELECT COALESCE(SUM(subtotal),0) FROM pedido_detalle WHERE id_pedido=%s) "
                "WHERE id_pedido=%s",
                (body.idPedido, body.idPedido)
            )
        db.commit()
        audit.registrar("PEDIDO_DETALLE_CREAR", body.actorEmail, ip, "pedido_detalle", new_id,
                        {"id_pedido": body.idPedido, "id_producto": body.idProducto,
                         "cantidad": body.cantidad, "precio_unit": precio_unit})
        return {"ok": True, "id_detalle": new_id}
    finally:
        db.close()


@router.put("/actualizar")
def actualizar(body: DetalleActualizar, request: Request):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            cur.execute("SELECT precio_unit, id_pedido FROM pedido_detalle WHERE id_detalle=%s",
                        (body.idDetalle,))
            det = cur.fetchone()
            if not det:
                return {"ok": False, "mensaje": "Detalle no encontrado"}

            subtotal = float(det["precio_unit"]) * body.cantidad
            cur.execute(
                "UPDATE pedido_detalle SET cantidad=%s, subtotal=%s WHERE id_detalle=%s",
                (body.cantidad, subtotal, body.idDetalle)
            )
            cur.execute(
                "UPDATE pedidos SET total=(SELECT COALESCE(SUM(subtotal),0) FROM pedido_detalle WHERE id_pedido=%s) "
                "WHERE id_pedido=%s",
                (det["id_pedido"], det["id_pedido"])
            )
        db.commit()
        audit.registrar("PEDIDO_DETALLE_ACTUALIZAR", body.actorEmail, ip, "pedido_detalle",
                        body.idDetalle, {"cantidad": body.cantidad})
        return {"ok": True}
    finally:
        db.close()


@router.delete("/eliminar/{id_detalle}")
def eliminar(id_detalle: int, request: Request, actorEmail: str = Query(...)):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            cur.execute("SELECT id_pedido FROM pedido_detalle WHERE id_detalle=%s", (id_detalle,))
            det = cur.fetchone()
            cur.execute("DELETE FROM pedido_detalle WHERE id_detalle=%s", (id_detalle,))
            if det:
                cur.execute(
                    "UPDATE pedidos SET total=(SELECT COALESCE(SUM(subtotal),0) FROM pedido_detalle WHERE id_pedido=%s) "
                    "WHERE id_pedido=%s",
                    (det["id_pedido"], det["id_pedido"])
                )
        db.commit()
        audit.registrar("PEDIDO_DETALLE_ELIMINAR", actorEmail, ip, "pedido_detalle", id_detalle, {})
        return {"ok": True}
    finally:
        db.close()
