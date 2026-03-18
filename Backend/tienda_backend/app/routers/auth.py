import hashlib
from fastapi import APIRouter, Request
from pydantic import BaseModel
from app.config import get_db
from app.services import audit

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    nombre: str
    password: str


def _hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


@router.post("/login")
def login(body: LoginRequest, request: Request):
    db = get_db()
    ip = request.client.host
    try:
        with db.cursor() as cur:
            cur.execute(
                "SELECT u.*, r.nombre AS rol FROM usuarios u "
                "JOIN roles r ON u.id_role = r.id_role "
                "WHERE u.email = %s OR u.nombre = %s",
                (body.nombre, body.nombre)
            )
            usuario = cur.fetchone()

        if not usuario:
            return {"ok": False, "mensaje": "Usuario no encontrado"}

        if usuario["bloqueado"]:
            return {"ok": False, "mensaje": "Usuario bloqueado"}

        if not usuario["activo"]:
            return {"ok": False, "mensaje": "Usuario inactivo"}

        pass_valida = usuario["pass_hash"] == _hash(body.password) or \
                      usuario["pass_hash"] == body.password

        if not pass_valida:
            intentos = (usuario["intentos_fallidos"] or 0) + 1
            bloqueado = intentos >= 3
            with db.cursor() as cur:
                cur.execute(
                    "UPDATE usuarios SET intentos_fallidos=%s, bloqueado=%s WHERE id_usuario=%s",
                    (intentos, bloqueado, usuario["id_usuario"])
                )
            db.commit()
            audit.registrar("LOGIN_FALLIDO", usuario["email"], ip, "usuarios",
                            usuario["id_usuario"], {"intento": intentos})
            msg = "Contraseña incorrecta"
            if bloqueado:
                msg = "Usuario bloqueado por demasiados intentos"
            return {"ok": False, "mensaje": msg}

        with db.cursor() as cur:
            cur.execute(
                "UPDATE usuarios SET intentos_fallidos=0, bloqueado=0 WHERE id_usuario=%s",
                (usuario["id_usuario"],)
            )
        db.commit()
        audit.registrar("LOGIN_EXITOSO", usuario["email"], ip, "usuarios",
                        usuario["id_usuario"], {"rol": usuario["rol"], "nombre": usuario["nombre"]})

        return {
            "ok": True,
            "id_usuario": usuario["id_usuario"],
            "email": usuario["email"],
            "nombre": usuario["nombre"],
            "rol": usuario["rol"],
        }
    finally:
        db.close()
