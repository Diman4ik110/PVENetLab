from flask import Flask, render_template, request, current_app, redirect
import forms
from proxmoxer import ProxmoxAPI

app = Flask(__name__)
app.config['SECRET_KEY'] = '123456789'
menu = [
    {'title': 'Топология', 'endpoint': 'topology'},
    {'title': 'Шаблоны', 'endpoint': 'templates'},
    {'title': 'Мониторинг', 'endpoint': 'monitor'}
]

@app.route('/', methods=['GET', 'POST'])
def index():
    form = forms.LoginForm()
    if form.validate_on_submit():
        # Вход в proxmox
        global proxmox
        proxmox = ProxmoxAPI(form.address.data, user=form.username.data, password=form.password.data, verify_ssl=False)
        # Проверка на доступность
        nodes = proxmox.nodes.get()
        print(nodes)
        
        return redirect('/topology')
    return render_template('login.html', form=form)

@app.route('/templates')
def templatesPage():
    return render_template('templates.html', vms=proxmox.nodes.get(), title='Шаблоны', menu_items=menu)

@app.route('/topology')
def topologyPage():
    return render_template('topology.html', title='Контакты', menu_items=menu)

@app.route('/monitor')
def monitorPage():
    return render_template('monitor.html', title='Контакты', menu_items=menu)

if __name__ == '__main__':
    app.run()