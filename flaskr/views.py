import json

from flask import render_template, flash, request, Blueprint
from flask_login import current_user

from flaskr import db
from flaskr.models import User,Vase

from .stl_generate import settings
import os

home_bp = Blueprint('home', __name__,template_folder='templates')

@home_bp.route('/', methods=['GET', 'POST'])
def home():

    if not current_user.is_authenticated:
        flash("Vases can be exported for printing from the right panel")
        flash("Sliders can be adjusted with arrow keys")
        flash("Log in to save vases, press load to see public vases")
    return render_template('home.html')

@home_bp.route('/saveVase', methods=['GET', 'POST'])
def save():

    vase_data = request.get_json()

    # pop the name and apperance out
    name = vase_data.pop("name")
    appearance = vase_data.pop("appearance")
    if "access" in vase_data.keys():
        access = vase_data.pop("access")
    else:
        access = "private"
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

    if current_user.is_authenticated:
        vase = db.session.scalars(db.select(Vase).filter_by(
            user_id = current_user.id,
            name=name)).all()
        if vase:
            print("vase updated",flush=True)
            vase[0].data = json.dumps(vase_data)
            vase[0].appearance = json.dumps(appearance)
            vase[0].set_access(access)
            db.session.commit()
        else:
            print("new vase")
            vase_mdl = Vase(
                user_id = current_user.id,
                name = name,
                data = json.dumps(vase_data),
                appearance = json.dumps(appearance))
            vase_mdl.set_access(access)
            db.session.add(vase_mdl)
            db.session.commit()
    
    return "Status OK"

@home_bp.route('/getIndex', methods=['GET', 'POST'])
def get_index():

    access = request.get_json()
    if current_user.is_authenticated:
        if access == "private":
            vases = db.session.scalars(db.select(Vase).filter_by(user_id =current_user.id)).all()
            data = [{"name" : elem.name,\
                     "user":current_user.username,\
                     "downloads": elem.downloads} 
                for elem in vases]
        elif access == "public":
            users = db.session.scalars(db.select(User)).all()
            id_name_dict = {elem.id : elem.username for elem in users}
            vases = db.session.scalars(db.select(Vase).filter_by(public = 1)).all()
            data = [{"name" : elem.name,\
                     "user":id_name_dict[elem.user_id],\
                     "downloads": elem.downloads} 
                for elem in vases]
        return json.dumps(data)
    else:
        users = db.session.scalars(db.select(User)).all()
        id_name_dict = {elem.id : elem.username for elem in users}
        vases = db.session.scalars(db.select(Vase).filter_by(public = 1)).all()
        data = [{"name" : elem.name,\
                 "user":id_name_dict[elem.user_id], \
                 "downloads": elem.downloads}
            for elem in vases]
        return json.dumps(data)

@home_bp.route('/loadVase', methods=['GET', 'POST'])
def load():

    data = request.get_json()

    if data != "":
        user_id = db.session.scalars(db.select(User).filter_by(
            username = data["user"])).all()[0].id
        vase = db.session.scalars(db.select(Vase).filter_by(
            user_id = user_id,
            name = data["name"])).all()
        if vase:
            vase_data =  vase[0].data
            appearance = vase[0].appearance
            downloads = vase[0].downloads             
        else:
            vase_data = default_vase()
            appearance = ""
            downloads = 0
    else:
        vase_data = default_vase()
        appearance = ""
        downloads = 0

        vase_data = json.dumps(vase_data) # Stringify vase data

    return json.dumps([vase_data,appearance,downloads])

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

    return json.dumps(vase_data)

@home_bp.route('/incrementDownload', methods=['GET', 'POST'])
def incrementDownloads():

    data = request.get_json()
    user_query = db.session.scalars(db.select(User).filter_by(\
            username = data["username"])).all()
    
    if user_query:
        user_id = user_query[0].id
        vase = db.session.scalars(db.select(Vase).filter_by(\
            user_id = user_id,\
            name=data["name"])).all()
    elif (current_user.is_authenticated):
        user_id = current_user.id,
        vase = db.session.scalars(db.select(Vase).filter_by(\
            user_id = user_id,\
            name=data["name"])).all()
    if vase:
        vase[0].increment_downloads()
        db.session.commit()
        print("vase downloads incremented",flush=True)
    else:
        print("vase not saved",flush=True)

    return json.dumps("Status OK")

# depreciated
@home_bp.route('/deleteFile', methods=['GET', 'POST'])
def delete_file():

    try:
        path = "flaskr" + request.get_json()
        if path != "flaskr/static/stl/default.stl":
            os.remove(path)
        return json.dumps({"status" : "OK"})
    except:
        return json.dumps({"status" : "Conflict"})

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
    "downloads" : 0
    }
