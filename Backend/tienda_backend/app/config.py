import os
from dotenv import load_dotenv
import pymysql

load_dotenv()

DB_HOST     = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT     = int(os.getenv("DB_PORT", 3306))
DB_USER     = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME     = os.getenv("DB_NAME", "TiendaVirtual")

SMTP_HOST   = os.getenv("SMTP_HOST", "127.0.0.1")
SMTP_PORT   = int(os.getenv("SMTP_PORT", 25))
SMTP_USER   = os.getenv("SMTP_USER", "")
SMTP_PASS   = os.getenv("SMTP_PASS", "")
SMTP_FROM   = os.getenv("SMTP_FROM", "no-reply@grupoX.os")

SFTP_HOST       = os.getenv("SFTP_HOST", "127.0.0.1")
SFTP_PORT       = int(os.getenv("SFTP_PORT", 22))
SFTP_USER       = os.getenv("SFTP_USER", "sftpuser")
SFTP_PASS       = os.getenv("SFTP_PASS", "")
SFTP_REMOTE_DIR = os.getenv("SFTP_REMOTE_DIR", "/home/sftpuser/facturas")


def get_db():
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False,
    )
