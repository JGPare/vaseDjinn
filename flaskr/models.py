from werkzeug.security import check_password_hash, generate_password_hash
from flask_login import UserMixin
from datetime import datetime
import os

import jwt
from time import time

from flaskr import db, login_manager
from flask_login import current_user

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

class User(db.Model,UserMixin):

    __tablename__ = 'users'
    id = db.Column(db.Integer,primary_key = True)
    email = db.Column(db.String(64),unique=True,index=True)
    username = db.Column(db.String(64),unique=True,index=True)
    password_hash = db.Column(db.String(128))
    vases = db.relationship('Vase', backref='creator', lazy=True, cascade="all, delete")
    admin = db.Column(db.Integer)

    def __init__(self,email,username,password,admin=0):
        self.username = username
        self.email = email
        self.password_hash = generate_password_hash(password)
        self.admin = admin

    def check_password(self,password):
        return check_password_hash(self.password_hash,password)
    
    def set_password(self,password):
        self.password_hash = generate_password_hash(password)
    
    def get_reset_token(self, expires=500):
        return jwt.encode({'reset_password': self.username, 'exp': time() + expires},
                            key=str(os.getenv('SECRET_KEY_FLASK')), algorithm="HS256")

    def __repr__(self):
        return f"UserName: {self.username}"
    
    @staticmethod
    def verify_reset_token(token):
        try:
            username = jwt.decode(token, key=str(os.getenv('SECRET_KEY_FLASK')), algorithms=["HS256"])['reset_password']
            print(username,flush=True)
        except Exception as e:
            print(e)
            return
        return User.query.filter_by(username=username).first()

    @staticmethod
    def get_all_users():
        return db.session.scalars(db.select(User)).all()

class Vase(db.Model):

    __tablename__ = 'vases'

    id = db.Column(db.Integer,primary_key= True)
    unique_name = db.Column(db.Text,unique=True,index=True)
    name = db.Column(db.Text)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    data = db.Column(db.String(512))
    appearance = db.Column(db.String(512))
    public = db.Column(db.Integer,index=True)
    downloads = db.Column(db.Integer)

    def __init__(self,user_id,name,data,appearance,public=0,downloads=0):
        self.user_id = user_id
        self.name = name
        self.data = data
        self.appearance = appearance
        self.public = public
        self.unique_name = f"{user_id}-{name}"
        self.downloads = downloads

    def __repr__(self):
        return f"Vase: {self.name}"

    def set_access(self,access):
        if access == "public":
            self.public = 1
        elif access == "private":
            self.public = 0

    def increment_downloads(self):
        self.downloads += 1

    @staticmethod
    def get_by_name(name):
        return Vase.get_by_name_and_id(name,current_user.id)

    @staticmethod
    def get_by_name_and_id(name,id):
        return db.session.scalars(db.select(Vase).filter_by(\
            user_id = id,
            name = name)).first()

    @staticmethod
    def get_by_name_and_username(name,username):
        user = db.session.scalars(db.select(User).filter_by(\
            username = username)).first()
        if user:
            return Vase.get_by_name_and_id(name,user.id)
        else:
            return False

    @staticmethod
    def get_all_private_vases():
        return db.session.scalars(db.select(Vase).filter_by(\
            user_id = current_user.id).order_by(\
            Vase.downloads.desc())).all()
    
    @staticmethod
    def get_all_public_vases():
        return db.session.scalars(db.select(Vase).filter_by(\
            public = 1).order_by(\
            Vase.downloads.desc())).all()