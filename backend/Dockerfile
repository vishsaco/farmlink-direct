FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py makemigrations accounts lots orders forecasts fulfillment routing
RUN python manage.py migrate
RUN python manage.py seed_demo

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
