import io
import paramiko
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from app.config import SFTP_HOST, SFTP_PORT, SFTP_USER, SFTP_PASS, SFTP_REMOTE_DIR


def generar_pdf_factura(pedido: dict, detalles: list) -> bytes:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    w, h = letter

    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, h - 60, "FACTURA DE PEDIDO")
    c.setFont("Helvetica", 12)
    c.drawString(50, h - 90,  f"Pedido #:  {pedido['id_pedido']}")
    c.drawString(50, h - 110, f"Cliente:   {pedido.get('nombre_usuario', 'N/A')}")
    c.drawString(50, h - 130, f"Email:     {pedido.get('email_usuario', 'N/A')}")
    c.drawString(50, h - 150, f"Estado:    {pedido['estado']}")
    c.drawString(50, h - 170, f"Fecha:     {pedido['creado_en']}")

    c.setFont("Helvetica-Bold", 11)
    y = h - 210
    c.drawString(50,  y, "Producto")
    c.drawString(280, y, "Cantidad")
    c.drawString(370, y, "Precio Unit.")
    c.drawString(470, y, "Subtotal")
    c.line(50, y - 5, 550, y - 5)

    c.setFont("Helvetica", 11)
    y -= 20
    for d in detalles:
        c.drawString(50,  y, str(d.get("nombre_producto", d["id_producto"])))
        c.drawString(280, y, str(d["cantidad"]))
        c.drawString(370, y, f"Q{float(d['precio_unit']):.2f}")
        c.drawString(470, y, f"Q{float(d['subtotal']):.2f}")
        y -= 18
        if y < 80:
            c.showPage()
            y = h - 60

    c.line(50, y, 550, y)
    y -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawString(370, y, "TOTAL:")
    c.drawString(470, y, f"Q{float(pedido['total']):.2f}")
    c.save()
    return buffer.getvalue()


def subir_factura_sftp(pedido_id: int, pdf_bytes: bytes) -> str:
    nombre_archivo = f"factura_{pedido_id}.pdf"
    ruta_remota = f"{SFTP_REMOTE_DIR}/{nombre_archivo}"

    transport = paramiko.Transport((SFTP_HOST, SFTP_PORT))
    transport.connect(username=SFTP_USER, password=SFTP_PASS)
    sftp = paramiko.SFTPClient.from_transport(transport)
    try:
        sftp.putfo(io.BytesIO(pdf_bytes), ruta_remota)
    finally:
        sftp.close()
        transport.close()
    return ruta_remota
