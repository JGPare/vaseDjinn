import json

from flask import render_template, flash, request, Blueprint
from flask_login import current_user

from flaskr import db
from flaskr.models import User,Vase

from .settings import default_vase, settings
from .processing import string_dict_to_int_dict

from flask_mail import Message

import os

home_bp = Blueprint('home', __name__,template_folder='templates')

@home_bp.route('/', methods=['GET', 'POST'])
def home():
    # replace with tutorial button???
    if not current_user.is_authenticated:
        flash("Vases can be exported for printing from the right panel")
        flash("Sliders can be adjusted with arrow keys")
        flash("Log in to save vases, press load to see public vases")
    return render_template('home.html')

@home_bp.route('/saveVase', methods=['GET', 'POST'])
def save():

    vase_data = request.get_json()

    name = vase_data.pop("name")
    appearance = vase_data.pop("appearance")
    
    if "access" in vase_data.keys():
        access = vase_data.pop("access")
    else:
        access = "private"

    vase_data = string_dict_to_int_dict(vase_data)

    if current_user.is_authenticated:
        vase = Vase.get_by_name(name)
        if vase:
            print("vase updated",flush=True)
            vase.data = json.dumps(vase_data)
            vase.appearance = json.dumps(appearance)
            vase.set_access(access)
        else:
            print("new vase",flush=True)
            vase = Vase(
                user_id = current_user.id,
                name = name,
                data = json.dumps(vase_data),
                appearance = json.dumps(appearance))
            vase.set_access(access)
            db.session.add(vase)
        db.session.commit()
    
    return "Status OK"

@home_bp.route('/getIndex', methods=['GET', 'POST'])
def get_index():

    access = request.get_json()
    data = False

    if current_user.is_authenticated and access == "private":
        vases = Vase.get_all_private_vases()
        data = [{"name" : elem.name,\
                    "user" : current_user.username,\
                    "downloads" : elem.downloads} 
            for elem in vases]
    else:
        users = User.get_all_users()
        id_name_dict = {elem.id : elem.username for elem in users}
        vases = Vase.get_all_public_vases()
        data = [{"name" : elem.name,\
                    "user":id_name_dict[elem.user_id],\
                    "downloads": elem.downloads} 
            for elem in vases]
    
    return json.dumps(data)

@home_bp.route('/loadVase', methods=['GET', 'POST'])
def load():

    data = request.get_json()
    vase = False

    if data:
        name = data["name"]
        username = data["user"]
        vase = Vase.get_by_name_and_username(name,username)
    
    if vase:
        vase_data =  vase.data
        appearance = vase.appearance
        downloads = vase.downloads             
    else:
        vase_data = default_vase
        appearance = ""
        downloads = 0
        vase_data = json.dumps(vase_data) 

    return json.dumps([vase_data,appearance,downloads])

@home_bp.route('/deleteVase', methods=['GET', 'POST'])
def delete_vase():

    name = request.get_json()

    if current_user.is_authenticated:
        vase = Vase.get_by_name(name)
        if vase:
            db.session.delete(vase)
            db.session.commit()
            print("vase deleted")
        else:
            print("no vase found")
    else:
        print("user not logged in")

    vase_data = default_vase

    return json.dumps(vase_data)

@home_bp.route('/incrementDownload', methods=['GET', 'POST'])
def increment_downloads():

    data = request.get_json()
    vase = False

    if data:
        name = data["name"]
        username = data["user"]

        vase = Vase.get_by_name_and_username(name,username)

        if not vase and current_user.is_authenticated:
            vase = Vase.get_by_name(name)

    if vase:
        vase.increment_downloads()
        db.session.commit()
        print("vase downloads incremented",flush=True)
        return json.dumps("Status OK")
    else:
        print("vase not incremented",flush=True)
        return json.dumps("Status Failed")

    

@home_bp.route('/loadSettings', methods=['GET', 'POST'])
def load_settings():
    return json.dumps(settings)

