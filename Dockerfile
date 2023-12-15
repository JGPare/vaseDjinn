FROM python:3.11.4-slim-bullseye
WORKDIR /vaseDjinn
COPY requirements.txt .
RUN apt-get update && apt-get install -y git
RUN pip install --no-cache-dir --upgrade -r requirements.txt
COPY . .
ARG FLASK_APP=app.py 
CMD ["gunicorn","-u","--bind","0.0.0.0:80","flaskr:create_app()"]