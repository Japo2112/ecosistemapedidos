from fastapi import APIRouter, Query
from typing import Optional
from app.config import get_db

router = APIRouter(prefix="/api/audit-log", tags=["Audit Log"])


@router.get("/listar")
def listar(evento: Optional[str] = None, actorEmail: Optional[str] = None,
           entidad: Optional[str] = None, fechaInicio: Optional[str] = None,
           fechaFin: Optional[str] = None, limite: int = Query(default=100, le=500)):
    db = get_db()
    try:
        sql = "SELECT * FROM audit_log WHERE 1=1"
        params = []
        if evento:
            sql += " AND evento LIKE %s"
            params.append(f"%{evento}%")
        if actorEmail:
            sql += " AND actor_email LIKE %s"
            params.append(f"%{actorEmail}%")
        if entidad:
            sql += " AND entidad = %s"
            params.append(entidad)
        if fechaInicio:
            sql += " AND DATE(creado_en) >= %s"
            params.append(fechaInicio)
        if fechaFin:
            sql += " AND DATE(creado_en) <= %s"
            params.append(fechaFin)
        sql += " ORDER BY creado_en DESC LIMIT %s"
        params.append(limite)
        with db.cursor() as cur:
            cur.execute(sql, params)
            return cur.fetchall()
    finally:
        db.close()
