import pytest
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.user import User
from app.models.inspection import InspectionReport
from app.models.ocr_job import OCRProcessingJob
from app.models.declaration import DeclarationField
from app.models.finding import ComplianceFinding
from app.services.ocr.worker import run_ocr_background_task

@pytest.mark.asyncio
async def test_compliance_integration_findings_persistence(setup_db):
    async with AsyncSessionLocal() as db_session:
        user_res = await db_session.execute(select(User).where(User.email == "officer@yogya.gov.in"))
        test_user = user_res.scalars().first()
        user_id = test_user.id if test_user else "dummy-user-id"

        insp = InspectionReport(
            user_id=user_id,
            reference_number="INSP-TEST-001",
            inspection_date="2026-08-25",
            status="DRAFT",
            overall_status="PENDING",
        )
        db_session.add(insp)
        await db_session.commit()

        job = OCRProcessingJob(
            inspection_id=insp.id,
            status="pending",
            progress=0.0,
            engine_used="Tesseract OCR v5",
        )
        db_session.add(job)
        await db_session.commit()

        decl_mrp = DeclarationField(
            inspection_id=insp.id,
            category="MRP",
            category_number="4",
            label="Maximum Retail Price",
            statutory_rule_ref="Rule 6(1)(e)",
            extracted_value="₹199.00",
            current_value="₹199.00",
            is_edited=False,
            status="DETECTED",
            confidence="High confidence",
        )
        db_session.add(decl_mrp)
        await db_session.commit()

        job_id = job.id
        insp_id = insp.id

    await run_ocr_background_task(job_id, insp_id)

    async with AsyncSessionLocal() as db_session:
        findings_res = await db_session.execute(
            select(ComplianceFinding).where(ComplianceFinding.inspection_id == insp_id)
        )
        findings = findings_res.scalars().all()
        assert len(findings) == 7

        mrp_finding = next(f for f in findings if f.category_number == "4")
        assert mrp_finding.status == "PASS"
        assert mrp_finding.inspection_id == insp_id

        mfg_finding = next(f for f in findings if f.category_number == "1")
        assert mfg_finding.status == "FAIL"

@pytest.mark.asyncio
async def test_compliance_integration_low_confidence_review_required(setup_db):
    async with AsyncSessionLocal() as db_session:
        user_res = await db_session.execute(select(User).where(User.email == "officer@yogya.gov.in"))
        test_user = user_res.scalars().first()
        user_id = test_user.id if test_user else "dummy-user-id"

        insp = InspectionReport(
            user_id=user_id,
            reference_number="INSP-TEST-002",
            inspection_date="2026-08-25",
            status="DRAFT",
            overall_status="PENDING",
        )
        db_session.add(insp)
        await db_session.commit()

        job = OCRProcessingJob(inspection_id=insp.id, status="pending", progress=0.0)
        db_session.add(job)
        await db_session.commit()

        decl_low = DeclarationField(
            inspection_id=insp.id,
            category="NET_QUANTITY",
            category_number="3",
            label="Net Quantity",
            extracted_value="500 g",
            current_value="500 g",
            is_edited=False,
            status="DETECTED",
            confidence="Review required",
        )
        db_session.add(decl_low)
        await db_session.commit()

        job_id = job.id
        insp_id = insp.id

    await run_ocr_background_task(job_id, insp_id)

    async with AsyncSessionLocal() as db_session:
        findings_res = await db_session.execute(
            select(ComplianceFinding).where(ComplianceFinding.inspection_id == insp_id)
        )
        findings = findings_res.scalars().all()
        net_qty_finding = next(f for f in findings if f.category_number == "3")
        assert net_qty_finding.status == "REVIEW_REQUIRED"

@pytest.mark.asyncio
async def test_compliance_integration_idempotency_retry(setup_db):
    async with AsyncSessionLocal() as db_session:
        user_res = await db_session.execute(select(User).where(User.email == "officer@yogya.gov.in"))
        test_user = user_res.scalars().first()
        user_id = test_user.id if test_user else "dummy-user-id"

        insp = InspectionReport(
            user_id=user_id,
            reference_number="INSP-TEST-003",
            inspection_date="2026-08-25",
            status="DRAFT",
            overall_status="PENDING",
        )
        db_session.add(insp)
        await db_session.commit()

        job1 = OCRProcessingJob(inspection_id=insp.id, status="pending", progress=0.0)
        db_session.add(job1)
        await db_session.commit()

        job1_id = job1.id
        insp_id = insp.id

    # First run
    await run_ocr_background_task(job1_id, insp_id)

    async with AsyncSessionLocal() as db_session:
        findings_res1 = await db_session.execute(
            select(ComplianceFinding).where(ComplianceFinding.inspection_id == insp_id)
        )
        count1 = len(findings_res1.scalars().all())
        assert count1 == 7

        job2 = OCRProcessingJob(inspection_id=insp_id, status="pending", progress=0.0)
        db_session.add(job2)
        await db_session.commit()
        job2_id = job2.id

    # Second run (retry)
    await run_ocr_background_task(job2_id, insp_id)

    async with AsyncSessionLocal() as db_session:
        findings_res2 = await db_session.execute(
            select(ComplianceFinding).where(ComplianceFinding.inspection_id == insp_id)
        )
        count2 = len(findings_res2.scalars().all())
        # Count must remain 7 (no duplicates)
        assert count2 == 7

@pytest.mark.asyncio
async def test_compliance_integration_user_edit_preservation(setup_db):
    async with AsyncSessionLocal() as db_session:
        user_res = await db_session.execute(select(User).where(User.email == "officer@yogya.gov.in"))
        test_user = user_res.scalars().first()
        user_id = test_user.id if test_user else "dummy-user-id"

        insp = InspectionReport(
            user_id=user_id,
            reference_number="INSP-TEST-004",
            inspection_date="2026-08-25",
            status="DRAFT",
            overall_status="PENDING",
        )
        db_session.add(insp)
        await db_session.commit()

        job = OCRProcessingJob(inspection_id=insp.id, status="pending", progress=0.0)
        db_session.add(job)
        await db_session.commit()

        decl_edited = DeclarationField(
            inspection_id=insp.id,
            category="MANUFACTURER",
            category_number="1",
            label="Manufacturer",
            extracted_value="Raw OCR String",
            current_value="User Verified Manufacturer Pvt Ltd",
            is_edited=True,
            status="DETECTED",
            confidence="High confidence",
        )
        db_session.add(decl_edited)
        await db_session.commit()

        job_id = job.id
        insp_id = insp.id

    await run_ocr_background_task(job_id, insp_id)

    async with AsyncSessionLocal() as db_session:
        decl_check_res = await db_session.execute(
            select(DeclarationField).where(DeclarationField.inspection_id == insp_id, DeclarationField.category == "MANUFACTURER")
        )
        decl_check = decl_check_res.scalar_one()
        assert decl_check.is_edited is True
        assert decl_check.current_value == "User Verified Manufacturer Pvt Ltd"

        findings_res = await db_session.execute(
            select(ComplianceFinding).where(ComplianceFinding.inspection_id == insp_id, ComplianceFinding.category_number == "1")
        )
        finding = findings_res.scalar_one()
        assert finding.status == "PASS"
