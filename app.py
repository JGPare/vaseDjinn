
from flaskr import create_app

if __name__ == '__main__':
    create_app = create_app()
    create_app.run(host="0.0.0.0",debug=True)
else:
    gunicorn_app = create_app()


