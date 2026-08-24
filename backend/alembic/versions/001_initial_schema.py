"""001_initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-24 22:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='officer'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    op.create_table(
        'inspection_reports',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('reference_number', sa.String(length=100), nullable=False),
        sa.Column('inspection_date', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.BigInteger(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='Draft'),
        sa.Column('product_name', sa.String(length=255), nullable=False, server_default=''),
        sa.Column('manufacturer', sa.String(length=255), nullable=False, server_default=''),
        sa.Column('address', sa.Text(), nullable=False, server_default=''),
        sa.Column('net_quantity', sa.String(length=100), nullable=False, server_default=''),
        sa.Column('mrp', sa.String(length=100), nullable=False, server_default=''),
        sa.Column('date_info', sa.String(length=100), nullable=False, server_default=''),
        sa.Column('consumer_care', sa.Text(), nullable=False, server_default=''),
        sa.Column('country_of_origin', sa.String(length=100), nullable=False, server_default=''),
        sa.Column('other_declarations', sa.Text(), nullable=False, server_default=''),
        sa.Column('overall_status', sa.String(length=50), nullable=False, server_default='INCONCLUSIVE'),
        sa.Column('stats_total_checked', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('stats_passed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('stats_needs_review', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('stats_failed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('observations', sa.Text(), nullable=False, server_default=''),
        sa.Column('rev_declarations_reviewed', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('rev_evidence_reviewed', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('rev_compliance_reviewed', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('rev_inspector_confirmed', sa.Boolean(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_inspection_reports_created_at'), 'inspection_reports', ['created_at'], unique=False)
    op.create_index(op.f('ix_inspection_reports_product_name'), 'inspection_reports', ['product_name'], unique=False)
    op.create_index(op.f('ix_inspection_reports_reference_number'), 'inspection_reports', ['reference_number'], unique=True)
    op.create_index(op.f('ix_inspection_reports_user_id'), 'inspection_reports', ['user_id'], unique=False)

    op.create_table(
        'declaration_fields',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('inspection_id', sa.String(length=36), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('category_number', sa.String(length=50), nullable=False),
        sa.Column('label', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False, server_default=''),
        sa.Column('statutory_rule_ref', sa.String(length=100), nullable=False, server_default=''),
        sa.Column('extracted_value', sa.Text(), nullable=False, server_default=''),
        sa.Column('current_value', sa.Text(), nullable=False, server_default=''),
        sa.Column('is_edited', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='NOT_DETECTED'),
        sa.Column('confidence', sa.String(length=50), nullable=False, server_default='Review required'),
        sa.Column('evidence_image_index', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['inspection_id'], ['inspection_reports.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_declaration_fields_inspection_id'), 'declaration_fields', ['inspection_id'], unique=False)

    op.create_table(
        'compliance_findings',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('inspection_id', sa.String(length=36), nullable=False),
        sa.Column('category_number', sa.String(length=50), nullable=False),
        sa.Column('requirement', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('severity', sa.String(length=50), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False, server_default=''),
        sa.Column('expected_condition', sa.Text(), nullable=False, server_default=''),
        sa.Column('detected_condition', sa.Text(), nullable=False, server_default=''),
        sa.Column('rule_reference', sa.String(length=100), nullable=False, server_default=''),
        sa.Column('inspector_note', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['inspection_id'], ['inspection_reports.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_compliance_findings_inspection_id'), 'compliance_findings', ['inspection_id'], unique=False)

    op.create_table(
        'evidence_images',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('inspection_id', sa.String(length=36), nullable=False),
        sa.Column('preview_url', sa.Text(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('related_requirement', sa.String(length=255), nullable=True),
        sa.Column('description', sa.Text(), nullable=False, server_default=''),
        sa.ForeignKeyConstraint(['inspection_id'], ['inspection_reports.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_evidence_images_inspection_id'), 'evidence_images', ['inspection_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_evidence_images_inspection_id'), table_name='evidence_images')
    op.drop_table('evidence_images')
    op.drop_index(op.f('ix_compliance_findings_inspection_id'), table_name='compliance_findings')
    op.drop_table('compliance_findings')
    op.drop_index(op.f('ix_declaration_fields_inspection_id'), table_name='declaration_fields')
    op.drop_table('declaration_fields')
    op.drop_index(op.f('ix_inspection_reports_user_id'), table_name='inspection_reports')
    op.drop_index(op.f('ix_inspection_reports_reference_number'), table_name='inspection_reports')
    op.drop_index(op.f('ix_inspection_reports_product_name'), table_name='inspection_reports')
    op.drop_index(op.f('ix_inspection_reports_created_at'), table_name='inspection_reports')
    op.drop_table('inspection_reports')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
