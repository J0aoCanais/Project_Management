"""Extension objects, created without an app.
 
They are attached to the real app inside create_app() via init_app(). Keeping
them here lets every blueprint import them without importing the app itself,
which avoids circular imports.
"""
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect

from .models import Base
 
db = SQLAlchemy(model_class=Base)
migrate = Migrate()
csrf = CSRFProtect()
limiter = Limiter(get_remote_address)  # storage comes from RATELIMIT_STORAGE_URI
 
login_manager = LoginManager()
login_manager.login_view = "auth.login"   # blueprint name + endpoint name
login_manager.session_protection = "strong"
