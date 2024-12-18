Описание проекта
Этот проект представляет собой веб-приложение для управления сотрудниками, отделами и типами работ, реализованное с использованием Django (бэкенд) и React (фронтенд). Приложение позволяет добавлять, редактировать, удалять записи, фильтровать данные и экспортировать их в форматы Microsoft Word и Excel.

Требования
Перед началом работы убедитесь, что на вашем устройстве установлены:
1. Python 3.8 или выше.
2. PostgreSQL 12 или выше.
3. Node.js и npm (Node Package Manager).
4. Виртуальное окружение Python (venv).

Шаги установки и запуска
1. Клонирование репозитория
Склонируйте проект на свое устройство:
bash
Копировать код
git clone <URL вашего репозитория>
cd <директория вашего проекта>

2. Настройка бэкенда (Django)
2.1 Создание виртуального окружения
Создайте и активируйте виртуальное окружение Python:
• На macOS/Linux:bash Копировать код   python3 -m venv venv
• source venv/bin/activate
•    
• На Windows:bash Копировать код   python -m venv venv
• venv\Scripts\activate
•    
2.2 Установка зависимостей
Установите необходимые библиотеки для работы Django:
bash
Копировать код
pip install -r requirements.txt
2.3 Настройка базы данных
1. Убедитесь, что PostgreSQL запущен.
2. Создайте базу данных для проекта:sql Копировать код   CREATE DATABASE employee_management;
3.    
4. Настройте доступ к базе данных в файле company/settings.py:python Копировать код   DATABASES = {
5.     'default': {
6.         'ENGINE': 'django.db.backends.postgresql',
7.         'NAME': 'employee_management',
8.         'USER': 'ваш_пользователь',
9.         'PASSWORD': 'ваш_пароль',
10.         'HOST': 'localhost',
11.         'PORT': '5432',
12.     }
13. }
14.    
2.4 Применение миграций
Примените миграции для создания таблиц в базе данных:
bash
Копировать код
python manage.py makemigrations
python manage.py migrate
2.5 Создание суперпользователя
Создайте учетную запись администратора:
bash
Копировать код
python manage.py createsuperuser
Заполните поля имени пользователя, email и пароля.
2.6 Запуск сервера Django
Запустите сервер разработки:
bash
Копировать код
python manage.py runserver
Сервер будет доступен по адресу: http://127.0.0.1:8000.

3. Настройка фронтенда (React)
3.1 Установка зависимостей
Перейдите в директорию фронтенда:
bash
Копировать код
cd frontend
npm install
3.2 Настройка API-адреса
Если API-сервер запускается на нестандартном хосте или порту, настройте базовый URL для запросов в файле src/apiConfig.js (если он есть) или непосредственно в вызовах axios.
3.3 Запуск React-приложения
Запустите сервер разработки React:
bash
Копировать код
npm start
Приложение будет доступно по адресу: http://localhost:3000.

4. Доступ к приложению
• Админ-панель Django: http://127.0.0.1:8000/admin Войдите с помощью учетных данных суперпользователя. 
• Пользовательский интерфейс React: http://localhost:3000 

5. Возможные команды
Управление миграциями
• Создание новых миграций:bash Копировать код   python manage.py makemigrations
•    
• Применение миграций:bash Копировать код   python manage.py migrate
•    
Запуск сервера Django
bash
Копировать код
python manage.py runserver
Запуск фронтенда React
bash
Копировать код
npm start

6. Структура проекта
plaintext
Копировать код
company/
├── company/
│   ├── settings.py       # Настройки Django
│   ├── urls.py           # Главные маршруты
│   └── ...
├── employees/
│   ├── models.py         # Модели базы данных
│   ├── serializers.py    # Сериализация данных
│   ├── views.py          # Логика API
│   └── ...
├── manage.py             # Управление проектом Django
frontend/
├── src/
│   ├── components/       # Общие компоненты (Header, Footer)
│   ├── pages/            # Страницы (EmployeeList, DepartmentList)
│   ├── App.js            # Главный файл React
│   └── ...

7. Возможные ошибки
Ошибка: django.db.utils.OperationalError: FATAL: password authentication failed for user
Решение: Проверьте правильность имени пользователя и пароля в настройках базы данных (settings.py).
Ошибка: ModuleNotFoundError: No module named 'django'
Решение: Убедитесь, что активировано виртуальное окружение, и выполните:
bash
Копировать код
pip install -r requirements.txt
Ошибка: GET /api/employees/ 404 Not Found
Решение: Проверьте, что маршруты API указаны верно в urls.py бэкенда и React.
