# ---- Stage 1: build the React bundle ---------------------------------------
FROM node:22-alpine AS frontend
WORKDIR /frontend
COPY frontend/package*.json ./
# `npm ci` once package-lock.json is committed (reproducible); `npm install` before that
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY frontend/ ./
# vite.config.ts writes to ../app/static/dist, which is /app/static/dist in this stage
RUN npm run build


FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first: this layer is cached until requirements.txt changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Then copy the application code
COPY . .

# Don't run as root inside the container
RUN useradd --create-home appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

# Production command. docker-compose.yml overrides it for local development.
CMD ["gunicorn", "-w", "3", "-b", "0.0.0.0:8000", "app:create_app()"]