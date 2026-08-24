from typing import Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.inspection import InspectionReport
from app.schemas.dashboard import DashboardStatsOut
from app.api.inspections import build_report_out

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsOut)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(InspectionReport).options(
        selectinload(InspectionReport.declarations),
        selectinload(InspectionReport.findings),
        selectinload(InspectionReport.evidence_images),
    )
    if current_user.role != "admin":
        query = query.where(InspectionReport.user_id == current_user.id)

    result = await db.execute(query.order_by(InspectionReport.created_at.desc()))
    reports = result.scalars().all()

    total = len(reports)
    compliant = sum(1 for r in reports if r.overall_status == "COMPLIANT")
    needs_review = sum(1 for r in reports if r.overall_status == "NEEDS REVIEW")
    non_compliant = sum(1 for r in reports if r.overall_status == "NON-COMPLIANT")
    inconclusive = sum(1 for r in reports if r.overall_status == "INCONCLUSIVE")

    compliance_rate = round((compliant / total * 100), 1) if total > 0 else 0.0

    recent_reports = [build_report_out(r).model_dump() for r in reports[:10]]

    # Aggregate violation categories from findings
    violation_categories: Dict[str, int] = {}
    for r in reports:
        for f in (r.findings or []):
            if f.status == "VIOLATION":
                cat = f.category_number or "General Rule"
                violation_categories[cat] = violation_categories.get(cat, 0) + 1

    return DashboardStatsOut(
        totalInspections=total,
        compliantCount=compliant,
        needsReviewCount=needs_review,
        nonCompliantCount=non_compliant,
        inconclusiveCount=inconclusive,
        complianceRate=compliance_rate,
        recentInspections=recent_reports,
        violationCategories=violation_categories,
    )
