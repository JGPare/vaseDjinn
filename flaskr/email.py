from flask import render_template
from flask_mail import Message
import os
from flaskr import mail

def send_password_reset_email(user):

    token = user.get_reset_token()

    msg = Message()
    msg.subject = "VaseDjinn Password Reset"
    msg.sender = os.getenv('SENDER_EMAIL')
    msg.recipients = [user.email]
    msg.html = render_template('email_password_reset.html', user=user, token=token)
    print(msg.sender,msg.recipients,flush=True)
    print(mail.send(msg),flush=True)