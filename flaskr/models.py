from werkzeug.security import check_password_hash, generate_password_hash
from flask_login import UserMixin
from datetime import datetime
from flaskr import db, login_manager

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

    def __repr__(self):
        return f"UserName: {self.username}"


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



