from app import run

class Config:
    DEBUG = True
    SECRET_KEY = 'your_secret_key'

run.config['MENU_ITEMS'] = [
    {'title': 'Главная', 'endpoint': 'index'},
    {
        'title': 'Услуги',
        'children': [
            {'title': 'Веб-разработка', 'endpoint': 'web_dev'},
            {'title': 'Дизайн', 'endpoint': 'design'},
        ]
    },
    {'title': 'Контакты', 'endpoint': 'contact'},
]
