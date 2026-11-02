
import click
from .extensions import hash_password
from .models import User, db

# ----------------------------------------------------------------------------
# CLI: there is no public signup, so accounts are created from the terminal
# ----------------------------------------------------------------------------
def register_cli(app):
    @app.cli.command("create-user")
    @click.argument("username")
    @click.argument("access_level", type=click.Choice(["owner", "investor"]))
    def create_user(username, access_level):
        """Create a user:  flask create-user alice owner"""
        if db.session.execute(
            db.select(User).filter_by(username=username)
        ).scalar_one_or_none():
            raise click.ClickException(f"User '{username}' already exists.")

        password = click.prompt("Password", hide_input=True, confirmation_prompt=True)
        if len(password) < 12:
            raise click.ClickException("Password must be at least 12 characters.")

        db.session.add(
            User(username=username, password_hash=hash_password(password), access_level=access_level, email=username)
        )
        db.session.commit()
        click.echo(f"Created {access_level} '{username}'.")