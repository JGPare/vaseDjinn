import json

from flask import render_template, url_for, flash, redirect, request, Blueprint
from flask_login import login_user, current_user, logout_user

from flaskr import db
from flaskr.models import User,Vase
# from flaskr.auth.forms import RegistrationForm, LoginForm

from .stl_generate import gen,settings

home_bp = Blueprint('home', __name__,template_folder='templates')

@home_bp.route('/', methods=['GET', 'POST'])
def home():
    flash("log in to save and load vases")
    return render_template('home.html')

@home_bp.route('/saveVase', methods=['GET', 'POST'])
def save():

    vase_data = request.get_json()

    # pop the name and apperance out
    name = vase_data.pop("name")
    appearance = vase_data.pop("appearance")
    print(appearance)
    # loop to convert content to ints
    for key in vase_data.keys():
        value = vase_data[key]
        if type(value) == list:
            for elem in value:
                for subkey in elem.keys():
                    elem[subkey] = int(elem[subkey])
        else:
            for subkey in value.keys():
                value[subkey] = int(value[subkey])
    
    gen(vase_data)

    if current_user.is_authenticated:
        vase = db.session.scalars(db.select(Vase).filter_by(
            user_id = current_user.id,
            name=name)).all()
        if vase:
            print("vase updated:")
            print(vase_data)
            print(appearance)
            vase[0].data = json.dumps(vase_data)
            vase[0].appearance = json.dumps(appearance)
            db.session.commit()
        else:
            print("new vase")
            vase_mdl = Vase(
                user_id = current_user.id,
                name = name,
                data = json.dumps(vase_data),
                appearance = json.dumps(appearance))
            db.session.add(vase_mdl)
            db.session.commit()
    
    return json.dumps({'status':'OK'})

@home_bp.route('/getIndex', methods=['GET', 'POST'])
def get_index():
    if current_user.is_authenticated:
        vases = db.session.scalars(db.select(Vase).filter_by(user_id =current_user.id)).all()
        names = [elem.name for elem in vases]
    else:
        systems = None
    return json.dumps(names)

@home_bp.route('/loadVase', methods=['GET', 'POST'])
def load():

    name = request.get_json()

    if current_user.is_authenticated:
        vase = db.session.scalars(db.select(Vase).filter_by(
            user_id = current_user.id,
            name=name)).all()
        if vase:
            vase_data =  vase[0].data
            appearance = vase[0].appearance

            print("vase reloaded")
            print(vase[0])
            print("Vase appearance",appearance)

            gen(json.loads(vase_data))
        else:
            print("default vase loaded")
            vase_data = default_vase()
            appearance = ""
            gen(vase_data)
    else:
        vase_data = default_vase()
        appearance = ""

    return json.dumps([vase_data,appearance])

@home_bp.route('/deleteVase', methods=['GET', 'POST'])
def delete():

    name = request.get_json()

    if current_user.is_authenticated:
        vase = db.session.scalars(db.select(Vase).filter_by(
            user_id = current_user.id,
            name=name)).all()
        if vase:
            db.session.delete(vase[0])
            db.session.commit()
            print("vase deleted")
        else:
            print("no vase found")
    else:
        print("user not logged in")
    vase_data = default_vase()
    gen(vase_data)

    return json.dumps(vase_data)

@home_bp.route('/loadSettings', methods=['GET', 'POST'])
def load_settings():
    return json.dumps(settings)

def default_vase():
    return {
    "generic0" : {
        "height" : 60,
        "width" : 20,
        "thickness" : 10,
     },
     "generic1" : {
        "radial_steps" : 50,
        "vertical_steps" : 50,
        "slope"  : 50,
     },
    "radial" : [
        { "mag" : 0,
        "freq" : 10,
        "twist" : 0,
        "phase" : 0,
        },
        { "mag" : 0,
        "freq" : 10,
        "twist" : 0,
        "phase" : 0,
        },
        # { "mag" : 0,
        # "freq" : 10,
        # "twist" : 0,
        # "phase" : 0,
        # },
        ],

    "vertical" : [
        { "mag" : 0,
        "freq" : 10,
        "phase" : 0,
        },
        { "mag" : 0,
        "freq" :  0,
        "phase" : 0,
        },
        # { "mag" : 0,
        # "freq" :  0,
        # "phase" : 0,
        # },
        ],
    }
