FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY web/backend ./backend

CMD ["sh", "-c", "uvicorn backend.server:app --host 0.0.0.0 --port 3001"]
