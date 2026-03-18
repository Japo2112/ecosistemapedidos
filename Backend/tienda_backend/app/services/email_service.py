import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM


def enviar_correo(destinatario: str, asunto: str, cuerpo_html: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = asunto
    msg["From"]    = SMTP_FROM
    msg["To"]      = destinatario
    msg.attach(MIMEText(cuerpo_html, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        if SMTP_USER:
            server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_FROM, destinatario, msg.as_string())


def correo_confirmacion_pedido(email: str, nombre: str, pedido_id: int, total: float):
    asunto = f"Confirmación de pedido #{pedido_id}"
    cuerpo = f"""
    <h2>¡Gracias por tu compra, {nombre}!</h2>
    <p>Tu pedido <strong>#{pedido_id}</strong> ha sido confirmado exitosamente.</p>
    <p>Total pagado: <strong>Q{total:.2f}</strong></p>
    <p>Puedes descargar tu factura desde el sistema.</p>
    <br><p>Tienda Virtual — Grupo X</p>
    """
    enviar_correo(email, asunto, cuerpo)
