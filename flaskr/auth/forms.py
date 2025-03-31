# Form Based Imports
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, BooleanField
from wtforms.validators import DataRequired,Email,EqualTo
from wtforms import ValidationError
from flask_wtf.file import FileField, FileAllowed

# User Based Imports
from flask_login import current_user
from flaskr.models import User

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Log In')

class PasswordResetForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    submit = SubmitField('Reset')

class PasswordResetVerifiedForm(FlaskForm):
    password = PasswordField('Password', validators=[DataRequired(message='Please enter valid password.'), EqualTo('pass_confirm', message='Passwords must match!')])
    pass_confirm = PasswordField('Confirm password', validators=[DataRequired(message='Please enter password again.')])

    submit = SubmitField('Set Password')

class RegistrationForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(message='Please enter valid email.'),Email(message='Please enter valid email.')])
    username = StringField('Username', validators=[DataRequired(message='Please enter valid username.')])
    password = PasswordField('Password', validators=[DataRequired(message='Please enter valid password.'), EqualTo('pass_confirm', message='Passwords must match!')])
    pass_confirm = PasswordField('Confirm password', validators=[DataRequired(message='Please enter password again.')])
    not_a_robot = BooleanField('NotARobot',false_values={False, 'false', '', 0})
    submit = SubmitField('Register')

    def validate_email(self, field):
        # Check if not None for that user email!
        if User.query.filter_by(email=field.data).first():
            raise ValidationError('Your email has been registered already!')

    def validate_username(self, field):
        # Check if not None for that username!
        if User.query.filter_by(username=field.data).first():
            raise ValidationError('Sorry, that username is taken!')


# class UpdateUserForm(FlaskForm):
#     email = StringField('Email', validators=[DataRequired(),Email()])
#     username = StringField('Username', validators=[DataRequired()])
#     picture = FileField('Update Profile Picture', validators=[FileAllowed(['jpg', 'png'])])
#     submit = SubmitField('Update')

#     def validate_email(self, field):
#         # Check if not None for that user email!
#         if User.query.filter_by(email=field.data).first():
#             raise ValidationError('Your email has been registered already!')

#     def validate_username(self, field):
#         # Check if not None for that username!
#         if User.query.filter_by(username=field.data).first():
#             raise ValidationError('Sorry, that username is taken!')
