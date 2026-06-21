FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/
RUN python manage.py collectstatic --noinput

EXPOSE 8080

# Run migrations and start server
CMD python manage.py migrate && gunicorn --bind 0.0.0.0:8080 config.wsgi:application
