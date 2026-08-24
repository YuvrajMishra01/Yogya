from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.inspection import InspectionReport
from app.schemas.product import ProductSummaryOut, ProductSummaryStats, ProductSampleImage
from app.api.inspections import build_report_out

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductSummaryOut])
async def get_products_catalog(
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

    # Group by Product Name
    grouped: Dict[str, List[InspectionReport]] = {}
    for r in reports:
        p_name = r.product_name.strip() or "Uncategorized Product"
        if p_name not in grouped:
            grouped[p_name] = []
        grouped[p_name].append(r)

    product_summaries: List[ProductSummaryOut] = []

    for name, product_reports in grouped.items():
        # Sort by creation date descending
        product_reports.sort(key=lambda x: x.created_at, reverse=True)
        latest_report = product_reports[0]
        oldest_report = product_reports[-1]

        passed_count = sum(1 for r in product_reports if r.overall_status == "COMPLIANT")
        needs_review_count = sum(1 for r in product_reports if r.overall_status == "NEEDS REVIEW")
        failed_count = sum(1 for r in product_reports if r.overall_status == "NON-COMPLIANT")

        # Find sample image
        sample_img = None
        for r in product_reports:
            if r.evidence_images and len(r.evidence_images) > 0:
                first_img = r.evidence_images[0]
                sample_img = ProductSampleImage(
                    id=first_img.id,
                    previewUrl=first_img.preview_url,
                    name=first_img.name
                )
                break

        product_id = f"prod-{name.lower().replace(' ', '-')}"

        product_summaries.append(
            ProductSummaryOut(
                id=product_id,
                name=name,
                manufacturer=latest_report.manufacturer,
                address=latest_report.address,
                netQuantity=latest_report.net_quantity,
                mrp=latest_report.mrp,
                countryOfOrigin=latest_report.country_of_origin,
                consumerCare=latest_report.consumer_care,
                firstInspectedDate=oldest_report.inspection_date,
                latestInspectionDate=latest_report.inspection_date,
                latestStatus=latest_report.overall_status,
                inspections=[build_report_out(r) for r in product_reports],
                sampleImage=sample_img,
                stats=ProductSummaryStats(
                    totalInspections=len(product_reports),
                    passed=passed_count,
                    needsReview=needs_review_count,
                    failed=failed_count,
                )
            )
        )

    return product_summaries

@router.get("/{product_name}", response_model=ProductSummaryOut)
async def get_product_detail(
    product_name: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    catalog = await get_products_catalog(db=db, current_user=current_user)
    for p in catalog:
        if p.name.lower() == product_name.lower() or p.id.lower() == product_name.lower():
            return p
    raise HTTPException(status_code=404, detail=f"Product '{product_name}' not found")
