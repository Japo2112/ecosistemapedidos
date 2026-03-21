#!/bin/bash
# Script de instalación del backend

echo "=== Instalando backend Tienda Virtual ==="

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install --upgrade pip
pip install -r requirements.txt

# Crear carpeta de logs
mkdir -p logs

echo "=== Instalación completada ==="
echo "Edita el archivo .env con tus credenciales y luego ejecuta: bash run.sh"
