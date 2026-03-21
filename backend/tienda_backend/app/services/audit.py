import json
from app.config import get_db


def registrar(evento: str, actor_email: str, ip: str, entidad: str, entidad_id: str, detalle: dict):
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                """INSERT INTO audit_log (evento, actor_email, ip_origen, entidad, entidad_id, detalle)
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (evento, actor_email, ip, entidad, str(entidad_id), json.dumps(detalle))
            )
        db.commit()
    finally:
        db.close()
