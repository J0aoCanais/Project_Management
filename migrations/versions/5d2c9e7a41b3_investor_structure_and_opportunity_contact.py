"""Investor structure (kind, CAEP, notes) without min/max amounts; contact on opportunities

Revision ID: 5d2c9e7a41b3
Revises: 8bf10af5234d
Create Date: 2026-11-20 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5d2c9e7a41b3'
down_revision = '8bf10af5234d'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('investor_profile', schema=None) as batch_op:
        # Existing profiles become "Particular" (the default) until someone edits them.
        batch_op.add_column(sa.Column('investor_kind', sa.String(length=512), nullable=False, server_default='Particular'))
        batch_op.add_column(sa.Column('caep_term', sa.String(length=512), nullable=True))
        batch_op.add_column(sa.Column('notes', sa.String(length=1000), nullable=True))
        batch_op.drop_column('min_amount')
        batch_op.drop_column('max_amount')

    with op.batch_alter_table('opportunity', schema=None) as batch_op:
        batch_op.add_column(sa.Column('contact_id', sa.BigInteger(), nullable=True))
        batch_op.create_index(batch_op.f('ix_opportunity_contact_id'), ['contact_id'], unique=False)
        batch_op.create_foreign_key('opportunity_contact_id_fkey', 'contact', ['contact_id'], ['id'])


def downgrade():
    with op.batch_alter_table('opportunity', schema=None) as batch_op:
        batch_op.drop_constraint('opportunity_contact_id_fkey', type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_opportunity_contact_id'))
        batch_op.drop_column('contact_id')

    with op.batch_alter_table('investor_profile', schema=None) as batch_op:
        batch_op.add_column(sa.Column('max_amount', sa.Float(precision=8), nullable=True))
        batch_op.add_column(sa.Column('min_amount', sa.Float(precision=8), nullable=True))
        batch_op.drop_column('notes')
        batch_op.drop_column('caep_term')
        batch_op.drop_column('investor_kind')
