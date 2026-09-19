FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libffi-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Check if requirements.txt is in root or backend/ and install
COPY requirements*.txt backend/requirements*.txt ./tmp_req/
RUN if [ -f ./tmp_req/requirements.txt ]; then \
        pip install --no-cache-dir -r ./tmp_req/requirements.txt; \
    else \
        pip install --no-cache-dir -r ./tmp_req/backend/requirements.txt; \
    fi && rm -rf ./tmp_req

# Copy all source files
COPY . .

# If backend/ directory exists, work from backend, else stay in /app
WORKDIR /app
CMD ["sh", "-c", "if [ -d 'backend' ]; then cd backend; fi && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
