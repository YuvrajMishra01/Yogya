import asyncio
import time
import uuid
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.user import User
from app.models.inspection import InspectionReport
from app.models.declaration import DeclarationField
from app.models.finding import ComplianceFinding
from app.models.evidence import EvidenceImage
from app.core.security import get_password_hash

async def seed_data():
    async with AsyncSessionLocal() as db:
        # Create Default Admin User
        admin_res = await db.execute(select(User).where(User.email == "admin@yogya.gov.in"))
        admin = admin_res.scalar_one_or_none()
        if not admin:
            admin = User(
                email="admin@yogya.gov.in",
                hashed_password=get_password_hash("Admin@123"),
                full_name="Chief Inspector Admin",
                role="admin"
            )
            db.add(admin)

        # Create Default Officer User
        officer_res = await db.execute(select(User).where(User.email == "officer@yogya.gov.in"))
        officer = officer_res.scalar_one_or_none()
        if not officer:
            officer = User(
                email="officer@yogya.gov.in",
                hashed_password=get_password_hash("Officer@123"),
                full_name="Enforcement Officer Rajesh Kumar",
                role="officer"
            )
            db.add(officer)

        await db.commit()
        await db.refresh(admin)
        await db.refresh(officer)

        # Check existing inspection reports
        reports_res = await db.execute(select(InspectionReport))
        existing_reports = reports_res.scalars().all()

        if len(existing_reports) == 0:
            now_ms = int(time.time() * 1000)

            # Demo Report 1: Kissan Peanut Butter
            report1 = InspectionReport(
                id="insp-demo-001",
                user_id=officer.id,
                reference_number="INSP-2025-0824-001",
                inspection_date="2025-08-24",
                created_at=now_ms - 86400000,
                status="Completed",
                product_name="Kissan Creamy Peanut Butter",
                manufacturer="Hindustan Unilever Limited",
                address="Unilever House, B. D. Sawant Marg, Chakala, Andheri East, Mumbai 400099",
                net_quantity="350 g",
                mrp="Rs 199.00 (Incl. of all taxes)",
                date_info="Mfg: 06/25 | Expiry: 12 months from mfg",
                consumer_care="1800-10-22-00 | lever.care@unilever.com",
                country_of_origin="India",
                other_declarations="FSSAI Lic No. 10013022001897 | Batch: KB2501",
                overall_status="COMPLIANT",
                stats_total_checked=8,
                stats_passed=8,
                stats_needs_review=0,
                stats_failed=0,
                observations="All statutory declarations under Legal Metrology Rules, 2011 are clearly visible and compliant.",
                rev_declarations_reviewed=True,
                rev_evidence_reviewed=True,
                rev_compliance_reviewed=True,
                rev_inspector_confirmed=True,
            )

            # Demo Report 2: Britannia Good Day Biscuits
            report2 = InspectionReport(
                id="insp-demo-002",
                user_id=officer.id,
                reference_number="INSP-2025-0824-002",
                inspection_date="2025-08-24",
                created_at=now_ms,
                status="Under Review",
                product_name="Britannia Good Day Butter Cookies",
                manufacturer="Britannia Industries Limited",
                address="5/1A Hungerford Street, Kolkata, West Bengal 700017",
                net_quantity="600 g",
                mrp="Rs 120.00",
                date_info="Pkd: 07/25",
                consumer_care="1800-425-4449",
                country_of_origin="India",
                other_declarations="Batch: GD8812",
                overall_status="NEEDS REVIEW",
                stats_total_checked=8,
                stats_passed=6,
                stats_needs_review=2,
                stats_failed=0,
                observations="Consumer care details partially smudged on packaging edge. Requires manual officer review.",
                rev_declarations_reviewed=True,
                rev_evidence_reviewed=True,
                rev_compliance_reviewed=False,
                rev_inspector_confirmed=False,
            )

            db.add_all([report1, report2])
            await db.commit()

            print("Database seeded successfully with default Admin, Officer, and 2 demo inspection reports!")
        else:
            print(f"Database already contains {len(existing_reports)} inspection reports.")

if __name__ == "__main__":
    asyncio.run(seed_data())
