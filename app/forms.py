from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired

# Форма входа в систему
class LoginForm(FlaskForm):
	address = StringField('Адрес сервера', validators=[DataRequired()])
	username = StringField('Имя пользователя', validators=[DataRequired()])
	password = PasswordField('Пароль', validators=[DataRequired()])
	remember_me = BooleanField('Запомнить меня')
	submit = SubmitField('Войти')