import os
import time
import logging
from sqlalchemy import select
import app.database
from app.models.inspection import InspectionReport
from app.models.ocr_job import OCRProcessingJob
from app.models.ocr_region import OCRTextRegionModel
from app.models.declaration import DeclarationField
from app.models.finding import ComplianceFinding
from app.services.ocr.tesseract import tesseract_ocr_service
from app.services.ocr.base import OCRTextRegion, OCRBoundingBox
from app.services.extraction.declarations import declaration_extractor
from app.services.compliance.rules import compliance_rule_engine

logger = logging.getLogger(__name__)

# Category mapping for Legal Metrology mandatory declarations
CATEGORY_META = {
    "manufacturer": {
        "category": "MANUFACTURER",
        "category_number": "1",
        "label": "Name and address of the manufacturer/packer/importer",
        "statutory_rule_ref": "Rule 6(1)(a)"
    },
    "address": {
        "category": "ADDRESS",
        "category_number": "2",
        "label": "Address of manufacturer/packer/importer",
        "statutory_rule_ref": "Rule 6(1)(a)"
    },
    "net_quantity": {
        "category": "NET_QUANTITY",
        "category_number": "3",
        "label": "Net Quantity of commodity",
        "statutory_rule_ref": "Rule 6(1)(b)"
    },
    "mrp": {
        "category": "MRP",
        "category_number": "4",
        "label": "Maximum Retail Price (MRP)",
        "statutory_rule_ref": "Rule 6(1)(e)"
    },
    "date_info": {
        "category": "MANUFACTURING_DATE",
        "category_number": "5",
        "label": "Month and year of manufacture/packing",
        "statutory_rule_ref": "Rule 6(1)(d)"
    },
    "consumer_care": {
        "category": "CONSUMER_CARE",
        "category_number": "6",
        "label": "Consumer Care details",
        "statutory_rule_ref": "Rule 6(1)(ac)"
    },
    "country_of_origin": {
        "category": "COUNTRY_OF_ORIGIN",
        "category_number": "7",
        "label": "Country of Origin",
        "statutory_rule_ref": "Rule 6(1)(aa)"
    }
}

async def run_ocr_background_task(job_id: str, inspection_id: str):
    """
    Background worker task for processing inspection evidence images with OCR.
    Updates OCRProcessingJob status (pending -> processing -> completed / failed),
    persists OCRTextRegionModel records for each evidence image, and automatically
    runs Legal Metrology declaration extraction to populate DeclarationField records.
    """
    async with app.database.AsyncSessionLocal() as db:
        job_result = await db.execute(select(OCRProcessingJob).where(OCRProcessingJob.id == job_id))
        job = job_result.scalar_one_or_none()
        if not job:
            logger.error(f"OCR Job {job_id} not found")
            return

        # Mark job as processing
        job.status = "processing"
        job.progress = 10.0
        job.updated_at = int(time.time() * 1000)
        await db.commit()

        start_time = time.time()

        try:
            # Retrieve inspection report with evidence_images
            insp_result = await db.execute(select(InspectionReport).where(InspectionReport.id == inspection_id))
            inspection = insp_result.scalar_one_or_none()

            if not inspection:
                job.status = "failed"
                job.error_message = f"Inspection {inspection_id} not found"
                job.updated_at = int(time.time() * 1000)
                await db.commit()
                return

            evidence_images = inspection.evidence_images or []

            all_raw_text_parts = []
            all_regions_models = []
            total_confidence_sum = 0.0
            total_regions_count = 0

            num_images = len(evidence_images)
            for idx, img_model in enumerate(evidence_images):
                img_url = img_model.preview_url or ""
                filename = os.path.basename(img_url)
                local_file_path = os.path.join("uploads", filename)

                if not os.path.exists(local_file_path):
                    if os.path.exists(img_url):
                        local_file_path = img_url
                    else:
                        logger.warning(f"Image file not found for OCR: {local_file_path}")
                        continue

                # Process image with OCR service
                ocr_res = await tesseract_ocr_service.extract_text(local_file_path, image_id=img_model.id)
                if ocr_res.raw_text:
                    all_raw_text_parts.append(ocr_res.raw_text)

                for r in ocr_res.regions:
                    region_model = OCRTextRegionModel(
                        job_id=job.id,
                        inspection_id=inspection_id,
                        evidence_image_id=img_model.id,
                        recognized_text=r.text,
                        confidence=r.confidence,
                        bbox_x=r.bbox.x,
                        bbox_y=r.bbox.y,
                        bbox_w=r.bbox.width,
                        bbox_h=r.bbox.height,
                        line_number=r.line_number,
                        word_number=r.word_number,
                    )
                    all_regions_models.append(region_model)
                    if r.confidence > 0:
                        total_confidence_sum += r.confidence
                        total_regions_count += 1

                progress_percent = min(90.0, 10.0 + ((idx + 1) / max(num_images, 1)) * 80.0)
                job.progress = round(progress_percent, 1)
                await db.commit()

            # Save all created region models
            for r_model in all_regions_models:
                db.add(r_model)
            await db.flush()

            combined_raw_text = " ".join(all_raw_text_parts)
            avg_conf = round(total_confidence_sum / total_regions_count, 1) if total_regions_count > 0 else 0.0
            elapsed_ms = round((time.time() - start_time) * 1000, 2)

            job.raw_text = combined_raw_text
            job.average_confidence = avg_conf
            job.processing_time_ms = elapsed_ms

            # Step: Run Declaration Extraction and persist DeclarationField records
            try:
                # Convert OCRTextRegionModel records into domain OCRTextRegion objects
                domain_regions = [
                    OCRTextRegion(
                        region_id=r.id,
                        text=r.recognized_text,
                        confidence=r.confidence,
                        bbox=OCRBoundingBox(x=r.bbox_x, y=r.bbox_y, width=r.bbox_w, height=r.bbox_h),
                        line_number=r.line_number,
                        word_number=r.word_number,
                    )
                    for r in all_regions_models
                ]

                extraction_result = declaration_extractor.extract_from_regions(
                    regions=domain_regions,
                    raw_text=combined_raw_text
                )

                if extraction_result.extracted_declarations:
                    # Query existing declarations for this inspection to prevent duplicates on retries
                    existing_decl_res = await db.execute(
                        select(DeclarationField).where(DeclarationField.inspection_id == inspection_id)
                    )
                    existing_fields_map = {d.category: d for d in existing_decl_res.scalars().all()}

                    for decl in extraction_result.extracted_declarations:
                        meta = CATEGORY_META.get(decl.field_type)
                        if not meta:
                            continue

                        category_name = meta["category"]
                        if category_name in existing_fields_map:
                            field = existing_fields_map[category_name]
                            field.extracted_value = decl.field_value
                            if not field.is_edited:
                                field.current_value = decl.field_value
                            field.status = "DETECTED"
                            field.confidence = f"{decl.confidence:.1f}%"
                            field.description = decl.raw_text
                            if decl.ocr_region_id:
                                field.ocr_region_id = decl.ocr_region_id
                        else:
                            field = DeclarationField(
                                inspection_id=inspection_id,
                                category=category_name,
                                category_number=meta["category_number"],
                                label=meta["label"],
                                description=decl.raw_text,
                                statutory_rule_ref=meta["statutory_rule_ref"],
                                extracted_value=decl.field_value,
                                current_value=decl.field_value,
                                is_edited=False,
                                status="DETECTED",
                                confidence=f"{decl.confidence:.1f}%",
                                ocr_region_id=decl.ocr_region_id,
                            )
                            db.add(field)

                    await db.flush()

            except Exception as extract_err:
                logger.error(f"Non-fatal error during declaration extraction for job {job_id}: {extract_err}", exc_info=True)

            # Step: Run Legal Metrology Compliance Rule Engine and persist ComplianceFinding records
            try:
                # Query all current DeclarationField records for this inspection
                updated_decls_res = await db.execute(
                    select(DeclarationField).where(DeclarationField.inspection_id == inspection_id)
                )
                all_decls = updated_decls_res.scalars().all()

                # Evaluate compliance rules
                eval_result = compliance_rule_engine.evaluate_declarations(all_decls)

                # Query existing ComplianceFinding records for idempotency on retries
                existing_findings_res = await db.execute(
                    select(ComplianceFinding).where(ComplianceFinding.inspection_id == inspection_id)
                )
                existing_findings_map = {f.category_number: f for f in existing_findings_res.scalars().all()}

                for finding in eval_result.findings:
                    cat_num = finding.category_number
                    if cat_num in existing_findings_map:
                        f_model = existing_findings_map[cat_num]
                        f_model.requirement = finding.requirement
                        f_model.status = finding.status
                        f_model.severity = finding.severity
                        f_model.reason = finding.reason
                        f_model.expected_condition = finding.expected_condition
                        f_model.detected_condition = finding.detected_condition
                        f_model.rule_reference = finding.rule_reference
                    else:
                        f_model = ComplianceFinding(
                            inspection_id=inspection_id,
                            category_number=cat_num,
                            requirement=finding.requirement,
                            status=finding.status,
                            severity=finding.severity,
                            reason=finding.reason,
                            expected_condition=finding.expected_condition,
                            detected_condition=finding.detected_condition,
                            rule_reference=finding.rule_reference,
                        )
                        db.add(f_model)

            except Exception as comp_err:
                logger.error(f"Non-fatal error during compliance evaluation for job {job_id}: {comp_err}", exc_info=True)

            job.status = "completed"
            job.progress = 100.0
            job.updated_at = int(time.time() * 1000)
            await db.commit()

        except Exception as exc:
            logger.error(f"Error processing OCR job {job_id}: {exc}", exc_info=True)
            job.status = "failed"
            job.error_message = str(exc)
            job.updated_at = int(time.time() * 1000)
            await db.commit()
