# ---------- Base Image ----------
FROM python:3.12-slim

# ---------- Working Directory ----------
WORKDIR /app

# ---------- Copy Requirements ----------
COPY requirements.txt .

# ---------- Install CPU-only PyTorch ----------
RUN pip install --no-cache-dir \
    --index-url https://download.pytorch.org/whl/cpu \
    torch

# ---------- Install Remaining Dependencies ----------
RUN pip install --no-cache-dir -r requirements.txt

# ---------- Copy Application ----------
COPY . .

# ---------- Make Startup Script Executable ----------
RUN chmod +x startup.sh

# ---------- Expose FastAPI Port ----------
EXPOSE 8000

# ---------- Start Backend ----------
CMD ["./startup.sh"]