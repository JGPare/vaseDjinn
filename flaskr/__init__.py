import os
import json
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from dotenv import load_dotenv
from flask_talisman import Talisman
from flask_mail import Mail

###############################################################################
############################# INITIATE EXTENSIONS #############################
###############################################################################

db = SQLAlchemy()
login_manager = LoginManager()
mail = Mail()

vite_manifest = None
# Load the Vite manifest
print("CWD",os.listdir())
with open('flaskr/static/dist/.vite/manifest.json') as f:
    vite_manifest = json.load(f)

# this is the "app factory"
def create_app(app_config=None):

    app = Flask(__name__)
    load_dotenv()

    # Often people will also separate these into a separate config.py file 
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
    app.config["PREFERRED_URL_SCHEME"] = "https"

###############################################################################
############################### DATABASE SETUPS ###############################
###############################################################################
   
    # basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    if app_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(app_config)

    db.init_app(app)
    Migrate(app,db)
    Talisman(app,content_security_policy=None)

###############################################################################
################################# MAIL SETUPS #################################
###############################################################################

    app.config['MAIL_SERVER'] = 'mail.hover.com'
    app.config['MAIL_PORT'] = 465
    app.config['MAIL_USE_SSL'] = True
    app.config['MAIL_USERNAME'] = os.getenv('SENDER_EMAIL')
    app.config['MAIL_PASSWORD'] = os.getenv('SENDER_EMAIL_PASSWORD')
    app.config['MAIL_USE_TLS'] = False 
    mail.init_app(app)
    
###############################################################################
################################ LOGIN CONFIGS ################################
###############################################################################

    # We can now pass in our app to the login manager
    login_manager.init_app(app)

    # Tell users what view to go to when they need to login.
    login_manager.login_view = "auth.login"

###############################################################################
############################## BLUEPRINT CONFIGS ##############################
###############################################################################

    # NOTE! These imports need to come after you've defined db, otherwise you will get errors in your models.py files.
    ## Grab the blueprints from the other views.py files for each "app"
    from flaskr.views import home_bp
    from flaskr.auth.views import auth_bp

    app.register_blueprint(auth_bp,url_prefix="/auth")
    app.register_blueprint(home_bp,url_prefix="/")
    app.add_url_rule('/', endpoint='home.home')

    return app


