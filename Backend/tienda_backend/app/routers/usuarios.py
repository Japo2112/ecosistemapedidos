import hashlib
from fastapi import APIRouter, Request, Query
from pydantic import BaseModel
from typing import Optional
from app.config import get_db
from app.services import audit

router = APIRouter(prefix="/api/usuarios", tags=["Usuarios"])


def _hash(p: str) -> str:
    return hashlib.sha256(p.encode()).hexdigest()


class UsuarioCrear(BaseModel):
    email: str
    passHash: str
    nombre: str
    idRole: int
    activo: int = 1
    actorEmail: str


class UsuarioActualizar(BaseModel):
    idUsuario: int
    email: str
    passHash: Optional[str] = None
    nombre: str
    idRole: int
    activo: int
    actorEmail: str


@router.get("/listar")
def listar(busqueda: Optional[str] = None, activo: Optional[int] = None,
           idRole: Optional[int] = None):
    db = get_db()
    try:
        sql = ("SELECT u.id_usuario, u.email, u.nombre, u.id_role, r.nombre AS rol, "
               "u.activo, u.bloqueado, u.intentos_fallidos, u.creado_en "
               "FROM usuarios u JOIN roles r ON u.id_role = r.id_role WHERE 1=1")
        params = []
        if busqueda:
            sql += " AND (u.nombre LIKE %s OR u.email LIKE %s)"
            params += [f"%{busqueda}%", f"%{busqueda}%"]
        if activo is not None:
            sql += " AND u.activo = %s"
            params.append(activo)
        if idRole is not None:
            sql += " AND u.id_role = %s"
            params.append(idRole)
        with db.cursor() as cur:
            cur.execute(sql, params)
            return cur.fetchall()
    finally:
        db.close()


@router.post("/crear")
def crear(body: UsuarioCrear, request: Request):
    db = get_db()
    ip = request.client.host
    try:
        pass_hash = _hash(body.passHash) if len(body.passHash) < 60 else body.passHash
        with db.cursor() as cur:
            cur.execute(
                "INSERT INTO usuarios (email, pass_hash, nombre, id_role, activo) VALUES (%s,%s,%s,%s,%s)",
                (body.email, pass_hash, body.nombre, body.idRole, body.activo)
            )
            new_id = cur.lastrowid
        db.commit()
        audit.registrar("USUARIO_CREAR", body.actorEmail, ip, "usuarios", new_id,
                        {"email": body.email, "nombre": body.nombre, "id_role": body.idRole})
        return {"ok": True, "id_usuario": new_id}
    finally:
        db.close()


@router.put("/actualizar")
def actualizar(body: UsuarioActualizar, request: Request):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            if body.passHash:
                pass_hash = _hash(body.passHash) if len(body.passHash) < 60 else body.passHash
                cur.execute(
                    "UPDATE usuarios SET email=%s, pass_hash=%s, nombre=%s, id_role=%s, activo=%s WHERE id_usuario=%s",
                    (body.email, pass_hash, body.nombre, body.idRole, body.activo, body.idUsuario)
                )
            else:
                cur.execute(
                    "UPDATE usuarios SET email=%s, nombre=%s, id_role=%s, activo=%s WHERE id_usuario=%s",
                    (body.email, body.nombre, body.idRole, body.activo, body.idUsuario)
                )
        db.commit()
        audit.registrar("USUARIO_ACTUALIZAR", body.actorEmail, ip, "usuarios", body.idUsuario,
                        {"email_nuevo": body.email, "rol": body.idRole, "activo": body.activo,
                         "email_anterior": body.email})
        return {"ok": True}
    finally:
        db.close()


@router.put("/desactivar/{id_usuario}")
def desactivar(id_usuario: int, request: Request, actorEmail: str = Query(...)):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            cur.execute("UPDATE usuarios SET activo=0 WHERE id_usuario=%s", (id_usuario,))
        db.commit()
        audit.registrar("USUARIO_DESACTIVAR", actorEmail, ip, "usuarios", id_usuario, {})
        return {"ok": True}
    finally:
        db.close()


@router.put("/desbloquear/{id_usuario}")
def desbloquear(id_usuario: int, request: Request, actorEmail: str = Query(...)):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            cur.execute(
                "UPDATE usuarios SET bloqueado=0, intentos_fallidos=0 WHERE id_usuario=%s",
                (id_usuario,)
            )
        db.commit()
        audit.registrar("USUARIO_DESBLOQUEADO", actorEmail, ip, "usuarios", id_usuario,
                        {"accion": "desbloqueo manual"})
        return {"ok": True}
    finally:
        db.close()
