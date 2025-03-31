from flask import render_template, url_for, flash, redirect, request, Blueprint
from flask_login import login_user, current_user, logout_user

from flaskr import db
from flaskr.models import User
from flaskr.auth.forms import RegistrationForm, LoginForm, PasswordResetForm, PasswordResetVerifiedForm

from flaskr.email import send_password_reset_email

auth_bp = Blueprint('auth', __name__,template_folder='templates/auth')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(email=form.email.data,
                    username=form.username.data,
                    password=form.password.data)
        isBot = form.not_a_robot.data
        print(isBot,flush=True)
        if (isBot is False):
          print("success", flush=True)
          db.session.add(user)
          db.session.commit()
        flash('Thanks for registering! Now you can login!')
        return redirect(url_for('auth.login'))

    return render_template('register.html', form=form)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():

    form = LoginForm()
    if form.validate_on_submit():

        # Grab the user from our User Models table
        user = User.query.filter_by(email=form.email.data).first()

        # Check that the user was supplied and the password is right
        # The verify_password method comes from the User object
        # https://stackoverflow.com/questions/2209755/python-operation-vs-is-not

        if user is not None and user.check_password(form.password.data):
            #Log in the user

            login_user(user)

            # If a user was trying to visit a page that requires a login
            # flask saves that URL as 'next'.
            next = request.args.get('next')

            # So let's now check if that next exists, otherwise we'll go to
            # the main page.
            if next == None:
                next = url_for('home.home')

            return redirect(next)

        if user is None:
            return redirect(url_for('auth.register'))

    return render_template('login.html', form=form)


@auth_bp.route('/resetPassword', methods=['GET', 'POST'])
def reset_password():

    form = PasswordResetForm()
    if form.validate_on_submit():

        user = User.query.filter_by(email=form.email.data).first()
        
        if user is not None:
            send_password_reset_email(user)
            return redirect(url_for('auth.login'))
        else:
            flash("Email not found, please try again")

    return render_template('password_reset.html', form=form)

@auth_bp.route('/resetVerified/<token>', methods=['GET', 'POST'])
def reset_verified(token):

    user = User.verify_reset_token(token)
    if not user:
        print('no user found',flush=True)
        return redirect(url_for('auth.login'))

    form = PasswordResetVerifiedForm()
    if form.validate_on_submit():
        password = form.password.data
        user.set_password(password)
        db.session.commit()
        flash("Password reset")
        return redirect(url_for('auth.login'))

    return render_template('reset_verified.html', form=form)

@auth_bp.route("/logout")
def logout():
    logout_user()
    return redirect(url_for('home.home'))
