from fastapi import APIRouter, Request, Query
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
from app.config import get_db
from app.services import audit
from app.services.email_service import correo_confirmacion_pedido
from app.services.sftp_service import generar_pdf_factura, subir_factura_sftp

router = APIRouter(prefix="/api/pedidos", tags=["Pedidos"])


class PedidoCrear(BaseModel):
    idUsuario: int
    actorEmail: str


@router.get("/listar")
def listar(idUsuario: Optional[int] = None, estado: Optional[str] = None,
           fechaInicio: Optional[str] = None, fechaFin: Optional[str] = None):
    db = get_db()
    try:
        sql = ("SELECT p.*, u.nombre AS nombre_usuario, u.email AS email_usuario "
               "FROM pedidos p JOIN usuarios u ON p.id_usuario = u.id_usuario WHERE 1=1")
        params = []
        if idUsuario:
            sql += " AND p.id_usuario = %s"
            params.append(idUsuario)
        if estado:
            sql += " AND p.estado = %s"
            params.append(estado)
        if fechaInicio:
            sql += " AND DATE(p.creado_en) >= %s"
            params.append(fechaInicio)
        if fechaFin:
            sql += " AND DATE(p.creado_en) <= %s"
            params.append(fechaFin)
        sql += " ORDER BY p.creado_en DESC"
        with db.cursor() as cur:
            cur.execute(sql, params)
            return cur.fetchall()
    finally:
        db.close()


@router.get("/obtener/{id_pedido}")
def obtener(id_pedido: int):
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                "SELECT p.*, u.nombre AS nombre_usuario, u.email AS email_usuario "
                "FROM pedidos p JOIN usuarios u ON p.id_usuario = u.id_usuario "
                "WHERE p.id_pedido = %s",
                (id_pedido,)
            )
            return cur.fetchone()
    finally:
        db.close()


@router.post("/crear")
def crear(body: PedidoCrear, request: Request):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            cur.execute(
                "INSERT INTO pedidos (id_usuario, estado, total) VALUES (%s, 'CREADO', 0.00)",
                (body.idUsuario,)
            )
            new_id = cur.lastrowid
        db.commit()
        audit.registrar("PEDIDO_CREAR", body.actorEmail, ip, "pedidos", new_id,
                        {"id_usuario": body.idUsuario, "estado": "CREADO", "total": 0.00})
        return {"ok": True, "id_pedido": new_id}
    finally:
        db.close()


@router.put("/confirmar-transaccion/{id_pedido}")
def confirmar(id_pedido: int, request: Request, actorEmail: str = Query(...)):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            # Recalcular total
            cur.execute(
                "SELECT SUM(subtotal) AS total, COUNT(*) AS cant FROM pedido_detalle WHERE id_pedido=%s",
                (id_pedido,)
            )
            res = cur.fetchone()
            total = float(res["total"] or 0)
            cant  = res["cant"]

            # Descontar stock
            cur.execute("SELECT id_producto, cantidad FROM pedido_detalle WHERE id_pedido=%s", (id_pedido,))
            detalles = cur.fetchall()
            for d in detalles:
                cur.execute(
                    "UPDATE productos SET stock = stock - %s WHERE id_producto=%s",
                    (d["cantidad"], d["id_producto"])
                )

            # Actualizar pedido
            cur.execute(
                "UPDATE pedidos SET estado='PAGADO', total=%s WHERE id_pedido=%s",
                (total, id_pedido)
            )

            # Obtener datos del usuario para email
            cur.execute(
                "SELECT u.email, u.nombre FROM pedidos p "
                "JOIN usuarios u ON p.id_usuario = u.id_usuario WHERE p.id_pedido=%s",
                (id_pedido,)
            )
            usuario = cur.fetchone()

        db.commit()

        audit.registrar("PEDIDO_CONFIRMAR_TRANSACCION", actorEmail, ip, "pedidos", id_pedido,
                        {"total": total, "estado_nuevo": "PAGADO", "cantidad_detalles": cant})

        # Enviar correo de confirmación
        try:
            correo_confirmacion_pedido(usuario["email"], usuario["nombre"], id_pedido, total)
        except Exception:
            pass  # No bloquear si falla el correo

        # Generar factura y subir por SFTP
        try:
            pedido_data = obtener(id_pedido)
            det_data = _listar_detalles(id_pedido)
            pdf = generar_pdf_factura(pedido_data, det_data)
            subir_factura_sftp(id_pedido, pdf)
        except Exception:
            pass  # No bloquear si falla SFTP

        return {"ok": True, "total": total}
    finally:
        db.close()


@router.put("/cancelar/{id_pedido}")
def cancelar(id_pedido: int, request: Request, actorEmail: str = Query(...)):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            cur.execute(
                "UPDATE pedidos SET estado='CANCELADO' WHERE id_pedido=%s AND estado='CREADO'",
                (id_pedido,)
            )
        db.commit()
        audit.registrar("PEDIDO_CANCELAR", actorEmail, ip, "pedidos", id_pedido,
                        {"estado_nuevo": "CANCELADO"})
        return {"ok": True}
    finally:
        db.close()


@router.delete("/eliminar/{id_pedido}")
def eliminar(id_pedido: int, request: Request, actorEmail: str = Query(...)):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            cur.execute("DELETE FROM pedidos WHERE id_pedido=%s", (id_pedido,))
        db.commit()
        audit.registrar("PEDIDO_ELIMINAR", actorEmail, ip, "pedidos", id_pedido, {})
        return {"ok": True}
    finally:
        db.close()


@router.get("/factura/{id_pedido}")
def factura(id_pedido: int):
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                "SELECT p.*, u.nombre AS nombre_usuario, u.email AS email_usuario "
                "FROM pedidos p JOIN usuarios u ON p.id_usuario = u.id_usuario "
                "WHERE p.id_pedido = %s",
                (id_pedido,)
            )
            pedido = cur.fetchone()
            cur.execute(
                "SELECT pd.*, pr.nombre AS nombre_producto "
                "FROM pedido_detalle pd JOIN productos pr ON pd.id_producto = pr.id_producto "
                "WHERE pd.id_pedido = %s",
                (id_pedido,)
            )
            detalles = cur.fetchall()
        pdf = generar_pdf_factura(pedido, detalles)
        return Response(
            content=pdf,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=factura_{id_pedido}.pdf"}
        )
    finally:
        db.close()


def _listar_detalles(id_pedido: int):
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                "SELECT pd.*, pr.nombre AS nombre_producto "
                "FROM pedido_detalle pd JOIN productos pr ON pd.id_producto = pr.id_producto "
                "WHERE pd.id_pedido = %s",
                (id_pedido,)
            )
            return cur.fetchall()
    finally:
        db.close()
