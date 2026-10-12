#!/bin/sh

echo "===================================="
echo "Starting EnterpriseIQ Backend..."
echo "===================================="

echo "Waiting for PostgreSQL..."
sleep 5

echo "Creating database tables..."
python create_tables.py

echo "Creating default admin..."
python create_admin.py

echo "Starting FastAPI..."
exec uvicorn main:app --host 0.0.0.0 --port 8000