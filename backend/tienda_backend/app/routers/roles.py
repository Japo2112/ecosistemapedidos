from fastapi import APIRouter, Request, Query
from pydantic import BaseModel
from app.config import get_db
from app.services import audit

router = APIRouter(prefix="/api/roles", tags=["Roles"])


class RolBody(BaseModel):
    nombre: str
    actorEmail: str


class RolActualizar(BaseModel):
    idRole: int
    nombre: str
    actorEmail: str


@router.get("/listar")
def listar():
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute("SELECT id_role, nombre FROM roles ORDER BY id_role")
            return cur.fetchall()
    finally:
        db.close()


@router.post("/crear")
def crear(body: RolBody, request: Request):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            cur.execute("INSERT INTO roles (nombre) VALUES (%s)", (body.nombre,))
            new_id = cur.lastrowid
        db.commit()
        audit.registrar("ROL_CREAR", body.actorEmail, ip, "roles", new_id, {"nombre": body.nombre})
        return {"ok": True, "id_role": new_id}
    finally:
        db.close()


@router.put("/actualizar")
def actualizar(body: RolActualizar, request: Request):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            cur.execute("UPDATE roles SET nombre=%s WHERE id_role=%s", (body.nombre, body.idRole))
        db.commit()
        audit.registrar("ROL_ACTUALIZAR", body.actorEmail, ip, "roles", body.idRole,
                        {"nombre": body.nombre})
        return {"ok": True}
    finally:
        db.close()


@router.delete("/eliminar/{id_role}")
def eliminar(id_role: int, request: Request, actorEmail: str = Query(...)):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            cur.execute("DELETE FROM roles WHERE id_role=%s", (id_role,))
        db.commit()
        audit.registrar("ROL_ELIMINAR", actorEmail, ip, "roles", id_role, {})
        return {"ok": True}
    finally:
        db.close()
