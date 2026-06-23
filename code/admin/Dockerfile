FROM python:3.12-slim as builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /build

RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends libpq5 && \
    rm -rf /var/lib/apt/lists/*

RUN groupadd -r appgroup && useradd -r -m -g appgroup appuser

COPY --from=builder /opt/venv /opt/venv

COPY . /app/

RUN chown -R appuser:appgroup /app

USER appuser

RUN python manage.py collectstatic --noinput

EXPOSE 8080

CMD python manage.py migrate && python manage.py seed_db && python manage.py createsuperuser --noinput || true && gunicorn --bind 0.0.0.0:8080 --workers 2 --threads 4 config.wsgi:application
