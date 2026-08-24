import uuid
import time
from sqlalchemy import String, BigInteger, Text, Boolean, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class InspectionReport(Base):
    __tablename__ = "inspection_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    reference_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    inspection_date: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[int] = mapped_column(BigInteger, default=lambda: int(time.time() * 1000), index=True)
    status: Mapped[str] = mapped_column(String(50), default="Draft")  # Draft | Under Review | Completed

    # Product Information
    product_name: Mapped[str] = mapped_column(String(255), default="", index=True)
    manufacturer: Mapped[str] = mapped_column(String(255), default="")
    address: Mapped[str] = mapped_column(Text, default="")
    net_quantity: Mapped[str] = mapped_column(String(100), default="")
    mrp: Mapped[str] = mapped_column(String(100), default="")
    date_info: Mapped[str] = mapped_column(String(100), default="")
    consumer_care: Mapped[str] = mapped_column(Text, default="")
    country_of_origin: Mapped[str] = mapped_column(String(100), default="")
    other_declarations: Mapped[str] = mapped_column(Text, default="")

    # Overall compliance status
    overall_status: Mapped[str] = mapped_column(String(50), default="INCONCLUSIVE")  # COMPLIANT | NEEDS REVIEW | NON-COMPLIANT | INCONCLUSIVE

    # Statistics aggregate counts
    stats_total_checked: Mapped[int] = mapped_column(Integer, default=0)
    stats_passed: Mapped[int] = mapped_column(Integer, default=0)
    stats_needs_review: Mapped[int] = mapped_column(Integer, default=0)
    stats_failed: Mapped[int] = mapped_column(Integer, default=0)

    # Observations & Notes
    observations: Mapped[str] = mapped_column(Text, default="")

    # Inspector Signoff / Review Confirmations
    rev_declarations_reviewed: Mapped[bool] = mapped_column(Boolean, default=False)
    rev_evidence_reviewed: Mapped[bool] = mapped_column(Boolean, default=False)
    rev_compliance_reviewed: Mapped[bool] = mapped_column(Boolean, default=False)
    rev_inspector_confirmed: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="inspections")
    declarations: Mapped[list["DeclarationField"]] = relationship("DeclarationField", back_populates="inspection", cascade="all, delete-orphan", lazy="selectin")
    findings: Mapped[list["ComplianceFinding"]] = relationship("ComplianceFinding", back_populates="inspection", cascade="all, delete-orphan", lazy="selectin")
    evidence_images: Mapped[list["EvidenceImage"]] = relationship("EvidenceImage", back_populates="inspection", cascade="all, delete-orphan", lazy="selectin")
    ocr_jobs: Mapped[list["OCRProcessingJob"]] = relationship("OCRProcessingJob", back_populates="inspection", cascade="all, delete-orphan", lazy="selectin")
