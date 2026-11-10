"""Application for Imoventures CRM.
 
Run locally:    flask run
Migrations:     RUN_MIGRATIONS=1 flask db upgrade
"""

from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix


from .config import Config
from .extensions import csrf, db, limiter, login_manager, migrate
from .security import register_security_hooks


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
 
    # Behind a reverse proxy (Render, Nginx, ...) so Flask sees the real scheme/IP.
    if app.config["IS_PROD"]:
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
 
    # Attach the shared extensions to this app
    db.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)
    login_manager.init_app(app)
    limiter.init_app(app)
 
    # Blueprints (imported here, after the extensions exist)
    from .auth.routes import auth_bp
    from .demos import demos_bp
    from .contacts.routes import contacts_bp
    from .properties.routes import properties_bp
 
    app.register_blueprint(demos_bp)                                # /, /health, /account
    app.register_blueprint(auth_bp)                                 # /login, /logout
    app.register_blueprint(contacts_bp, url_prefix="/api/contacts")     # /contacts
    app.register_blueprint(properties_bp, url_prefix="/api/properties")
 
    register_security_hooks(app)
 
    from .cli import register_cli
 
    register_cli(app)
 
    return app
