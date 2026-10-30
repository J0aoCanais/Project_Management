"""Database models. Work in progress these are just temporary"""
import sqlalchemy as sa
from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    role = db.Column(db.Enum("owner", "investor", name="user_role"), nullable=False)


class Property(db.Model):
    __tablename__ = "properties"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    address = db.Column(db.Text)
    status = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "status": self.status,
        }


class Investment(db.Model):
    __tablename__ = "investments"

    investor_id = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    property_id = db.Column(
        db.Integer, db.ForeignKey("properties.id", ondelete="CASCADE"), primary_key=True
    )
    amount = db.Column(db.Numeric(14, 2), nullable=False)

    investor = db.relationship("User")

    __table_args__ = (
        sa.CheckConstraint("amount > 0", name="ck_investments_amount_positive"),
        sa.Index("ix_investments_property_id", "property_id"),
    )