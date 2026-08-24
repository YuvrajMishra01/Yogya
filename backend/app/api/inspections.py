import uuid
import time
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, delete
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.inspection import InspectionReport
from app.models.declaration import DeclarationField
from app.models.finding import ComplianceFinding
from app.models.evidence import EvidenceImage
from app.schemas.inspection import (
    InspectionReportOut,
    InspectionReportIn,
    InspectionReportPatch,
    StatsSchema,
    ReviewConfirmationSchema,
)
from app.schemas.declaration import DeclarationFieldOut
from app.schemas.finding import ComplianceFindingOut
from app.schemas.evidence import EvidenceImageOut
from app.services.storage import storage_service

router = APIRouter(prefix="/inspections", tags=["Inspections"])

def build_report_out(report: InspectionReport) -> InspectionReportOut:
    return InspectionReportOut(
        id=report.id,
        referenceNumber=report.reference_number,
        inspectionDate=report.inspection_date,
        createdAt=report.created_at,
        status=report.status,
        productName=report.product_name,
        manufacturer=report.manufacturer,
        address=report.address,
        netQuantity=report.net_quantity,
        mrp=report.mrp,
        dateInfo=report.date_info,
        consumerCare=report.consumer_care,
        countryOfOrigin=report.country_of_origin,
        otherDeclarations=report.other_declarations,
        declarations=[
            DeclarationFieldOut(
                id=d.id,
                category=d.category,
                categoryNumber=d.category_number,
                label=d.label,
                description=d.description,
                statutoryRuleRef=d.statutory_rule_ref,
                extractedValue=d.extracted_value,
                currentValue=d.current_value,
                isEdited=d.is_edited,
                status=d.status,
                confidence=d.confidence,
                evidenceImageIndex=d.evidence_image_index,
            ) for d in (report.declarations or [])
        ],
        overallStatus=report.overall_status,
        stats=StatsSchema(
            totalChecked=report.stats_total_checked,
            passed=report.stats_passed,
            needsReview=report.stats_needs_review,
            failed=report.stats_failed,
        ),
        findings=[
            ComplianceFindingOut(
                id=f.id,
                categoryNumber=f.category_number,
                requirement=f.requirement,
                status=f.status,
                severity=f.severity,
                reason=f.reason,
                expectedCondition=f.expected_condition,
                detectedCondition=f.detected_condition,
                ruleReference=f.rule_reference,
                inspectorNote=f.inspector_note,
            ) for f in (report.findings or [])
        ],
        evidenceImages=[
            EvidenceImageOut(
                id=e.id,
                previewUrl=e.preview_url,
                name=e.name,
                relatedRequirement=e.related_requirement,
                description=e.description,
            ) for e in (report.evidence_images or [])
        ],
        observations=report.observations,
        reviewConfirmation=ReviewConfirmationSchema(
            declarationsReviewed=report.rev_declarations_reviewed,
            evidenceReviewed=report.rev_evidence_reviewed,
            complianceReviewed=report.rev_compliance_reviewed,
            inspectorConfirmed=report.rev_inspector_confirmed,
        ),
    )

@router.post("", response_model=InspectionReportOut, status_code=status.HTTP_201_CREATED)
async def create_inspection(
    files: List[UploadFile] = File(default=[]),
    productName: Optional[str] = Form(None),
    manufacturer: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now()
    ref_num = f"INSP-{now.strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    created_timestamp = int(time.time() * 1000)

    report = InspectionReport(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        reference_number=ref_num,
        inspection_date=now.strftime("%Y-%m-%d"),
        created_at=created_timestamp,
        status="Draft",
        product_name=productName or "New Inspection Sample",
        manufacturer=manufacturer or "",
        overall_status="INCONCLUSIVE",
        stats_total_checked=0,
        stats_passed=0,
        stats_needs_review=0,
        stats_failed=0,
        observations="",
    )
    db.add(report)
    await db.flush()

    # Process and associate uploaded evidence images
    for index, file in enumerate(files):
        if file.filename:
            file_id, preview_url = await storage_service.save_file(file)
            evidence = EvidenceImage(
                id=file_id,
                inspection_id=report.id,
                preview_url=preview_url,
                name=file.filename,
                description=f"Label evidence image #{index + 1}",
            )
            db.add(evidence)

    await db.commit()

    # Reload with relationships
    result = await db.execute(
        select(InspectionReport)
        .options(
            selectinload(InspectionReport.declarations),
            selectinload(InspectionReport.findings),
            selectinload(InspectionReport.evidence_images),
        )
        .where(InspectionReport.id == report.id)
    )
    saved_report = result.scalar_one()
    return build_report_out(saved_report)

@router.get("", response_model=List[InspectionReportOut])
async def list_inspections(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    startDate: Optional[str] = Query(None),
    endDate: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(InspectionReport).options(
        selectinload(InspectionReport.declarations),
        selectinload(InspectionReport.findings),
        selectinload(InspectionReport.evidence_images),
    )

    # RBAC filtering: Officers only see own inspections
    if current_user.role != "admin":
        query = query.where(InspectionReport.user_id == current_user.id)

    # Filters
    if status_filter:
        query = query.where(InspectionReport.status == status_filter)
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                InspectionReport.product_name.ilike(search_pattern),
                InspectionReport.reference_number.ilike(search_pattern),
                InspectionReport.manufacturer.ilike(search_pattern),
            )
        )
    if startDate:
        query = query.where(InspectionReport.inspection_date >= startDate)
    if endDate:
        query = query.where(InspectionReport.inspection_date <= endDate)

    # Sorting & Pagination
    offset = (page - 1) * limit
    query = query.order_by(InspectionReport.created_at.desc()).offset(offset).limit(limit)

    result = await db.execute(query)
    reports = result.scalars().all()
    return [build_report_out(r) for r in reports]

@router.get("/{inspection_id}", response_model=InspectionReportOut)
async def get_inspection(
    inspection_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(InspectionReport)
        .options(
            selectinload(InspectionReport.declarations),
            selectinload(InspectionReport.findings),
            selectinload(InspectionReport.evidence_images),
        )
        .where(InspectionReport.id == inspection_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Inspection report not found")

    # Ownership / Role check
    if current_user.role != "admin" and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have access to this inspection")

    return build_report_out(report)

@router.patch("/{inspection_id}", response_model=InspectionReportOut)
async def update_inspection(
    inspection_id: str,
    patch_in: InspectionReportPatch,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(InspectionReport)
        .options(
            selectinload(InspectionReport.declarations),
            selectinload(InspectionReport.findings),
            selectinload(InspectionReport.evidence_images),
        )
        .where(InspectionReport.id == inspection_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Inspection report not found")

    # Authorization Check
    if current_user.role != "admin":
        if report.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Forbidden: Cannot modify another officer's inspection")
        if report.status not in ["Draft", "Under Review"]:
            raise HTTPException(status_code=400, detail="Completed inspections cannot be modified by officers")

    # Update top-level fields
    for field in [
        "status", "productName", "manufacturer", "address", "netQuantity",
        "mrp", "dateInfo", "consumerCare", "countryOfOrigin", "otherDeclarations",
        "overallStatus", "observations"
    ]:
        val = getattr(patch_in, field)
        if val is not None:
            db_attr = {
                "productName": "product_name",
                "netQuantity": "net_quantity",
                "dateInfo": "date_info",
                "consumerCare": "consumer_care",
                "countryOfOrigin": "country_of_origin",
                "otherDeclarations": "other_declarations",
                "overallStatus": "overall_status",
            }.get(field, field)
            setattr(report, db_attr, val)

    if patch_in.stats is not None:
        report.stats_total_checked = patch_in.stats.totalChecked
        report.stats_passed = patch_in.stats.passed
        report.stats_needs_review = patch_in.stats.needsReview
        report.stats_failed = patch_in.stats.failed

    if patch_in.reviewConfirmation is not None:
        report.rev_declarations_reviewed = patch_in.reviewConfirmation.declarationsReviewed
        report.rev_evidence_reviewed = patch_in.reviewConfirmation.evidenceReviewed
        report.rev_compliance_reviewed = patch_in.reviewConfirmation.complianceReviewed
        report.rev_inspector_confirmed = patch_in.reviewConfirmation.inspectorConfirmed

    # Update Declarations if provided
    if patch_in.declarations is not None:
        await db.execute(delete(DeclarationField).where(DeclarationField.inspection_id == report.id))
        for d in patch_in.declarations:
            decl = DeclarationField(
                id=d.id or str(uuid.uuid4()),
                inspection_id=report.id,
                category=d.category,
                category_number=d.categoryNumber,
                label=d.label,
                description=d.description,
                statutory_rule_ref=d.statutoryRuleRef,
                extracted_value=d.extractedValue,
                current_value=d.currentValue,
                is_edited=d.isEdited,
                status=d.status,
                confidence=d.confidence,
                evidence_image_index=d.evidenceImageIndex,
            )
            db.add(decl)

    # Update Findings if provided
    if patch_in.findings is not None:
        await db.execute(delete(ComplianceFinding).where(ComplianceFinding.inspection_id == report.id))
        for f in patch_in.findings:
            finding = ComplianceFinding(
                id=f.id or str(uuid.uuid4()),
                inspection_id=report.id,
                category_number=f.categoryNumber,
                requirement=f.requirement,
                status=f.status,
                severity=f.severity,
                reason=f.reason,
                expected_condition=f.expectedCondition,
                detected_condition=f.detectedCondition,
                rule_reference=f.ruleReference,
                inspector_note=f.inspectorNote,
            )
            db.add(finding)

    await db.commit()

    # Re-query updated report
    result = await db.execute(
        select(InspectionReport)
        .options(
            selectinload(InspectionReport.declarations),
            selectinload(InspectionReport.findings),
            selectinload(InspectionReport.evidence_images),
        )
        .where(InspectionReport.id == report.id)
    )
    updated_report = result.scalar_one()
    return build_report_out(updated_report)

@router.delete("/{inspection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_inspection(
    inspection_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(InspectionReport)
        .options(selectinload(InspectionReport.evidence_images))
        .where(InspectionReport.id == inspection_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Inspection report not found")

    # Authorization Check
    if current_user.role != "admin":
        if report.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Forbidden: Cannot delete another officer's inspection")
        if report.status not in ["Draft", "Under Review"]:
            raise HTTPException(status_code=400, detail="Cannot delete completed inspections")

    # Delete local evidence files
    for image in report.evidence_images:
        storage_service.delete_file(image.preview_url)

    await db.delete(report)
    await db.commit()
    return None

# =====================================================================
# Phase 2 Stage 2 — OCR Background Pipeline Endpoints
# =====================================================================

from fastapi import BackgroundTasks
from app.models.ocr_job import OCRProcessingJob
from app.models.ocr_region import OCRTextRegionModel
from app.schemas.ocr import OCRJobStatusResponse, OCRResultsResponse, OCRTextRegionSchema, OCRBoundingBoxSchema
from app.services.ocr.worker import run_ocr_background_task

@router.post("/{inspection_id}/process-ocr", response_model=OCRJobStatusResponse, status_code=status.HTTP_202_ACCEPTED)
async def process_ocr(
    inspection_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(InspectionReport).where(InspectionReport.id == inspection_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Inspection report not found")

    # Authorization Check (RBAC: Officer can only process own inspection; Admin can process any)
    if current_user.role != "admin" and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: Cannot process OCR for another officer's inspection")

    # Create new OCRProcessingJob record with status 'pending'
    job = OCRProcessingJob(
        inspection_id=inspection_id,
        status="pending",
        engine_used="Tesseract OCR v5",
        progress=0.0
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    # Schedule non-blocking async background worker
    background_tasks.add_task(run_ocr_background_task, job.id, inspection_id)

    return OCRJobStatusResponse(
        id=job.id,
        job_id=job.id,
        inspection_id=job.inspection_id,
        status=job.status,
        engine_used=job.engine_used,
        progress=job.progress,
        processing_time_ms=job.processing_time_ms,
        error_message=job.error_message,
        created_at=job.created_at,
        updated_at=job.updated_at,
    )


@router.get("/{inspection_id}/ocr-status", response_model=OCRJobStatusResponse)
async def get_ocr_status(
    inspection_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(InspectionReport).where(InspectionReport.id == inspection_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Inspection report not found")

    if current_user.role != "admin" and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: Cannot view OCR status for another officer's inspection")

    # Fetch latest OCR job for this inspection
    job_res = await db.execute(
        select(OCRProcessingJob)
        .where(OCRProcessingJob.inspection_id == inspection_id)
        .order_by(OCRProcessingJob.created_at.desc())
    )
    job = job_res.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="No OCR processing job found for this inspection")

    return OCRJobStatusResponse(
        id=job.id,
        job_id=job.id,
        inspection_id=job.inspection_id,
        status=job.status,
        engine_used=job.engine_used,
        progress=job.progress,
        processing_time_ms=job.processing_time_ms,
        error_message=job.error_message,
        created_at=job.created_at,
        updated_at=job.updated_at,
    )


@router.get("/{inspection_id}/ocr-results", response_model=OCRResultsResponse)
async def get_ocr_results(
    inspection_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(InspectionReport).where(InspectionReport.id == inspection_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Inspection report not found")

    if current_user.role != "admin" and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: Cannot view OCR results for another officer's inspection")

    # Fetch latest OCR job with regions
    job_res = await db.execute(
        select(OCRProcessingJob)
        .options(selectinload(OCRProcessingJob.regions))
        .where(OCRProcessingJob.inspection_id == inspection_id)
        .order_by(OCRProcessingJob.created_at.desc())
    )
    job = job_res.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="No OCR results found for this inspection")

    region_schemas = [
        OCRTextRegionSchema(
            id=r.id,
            job_id=r.job_id,
            inspection_id=r.inspection_id,
            evidence_image_id=r.evidence_image_id,
            recognized_text=r.recognized_text,
            confidence=r.confidence,
            bbox=OCRBoundingBoxSchema(x=r.bbox_x, y=r.bbox_y, width=r.bbox_w, height=r.bbox_h),
            line_number=r.line_number,
            word_number=r.word_number,
        )
        for r in (job.regions or [])
    ]

    return OCRResultsResponse(
        id=job.id,
        job_id=job.id,
        inspection_id=job.inspection_id,
        status=job.status,
        raw_text=job.raw_text,
        average_confidence=job.average_confidence,
        processing_time_ms=job.processing_time_ms,
        regions=region_schemas,
        error_message=job.error_message,
    )
