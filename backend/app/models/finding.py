import uuid
from typing import Optional
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class ComplianceFinding(Base):
    __tablename__ = "compliance_findings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    inspection_id: Mapped[str] = mapped_column(String(36), ForeignKey("inspection_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    
    category_number: Mapped[str] = mapped_column(String(50), nullable=False)
    requirement: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)  # PASSED | NEEDS_REVIEW | VIOLATION
    severity: Mapped[str] = mapped_column(String(50), nullable=False)  # Critical | Major | Minor | Advisory
    reason: Mapped[str] = mapped_column(Text, default="")
    expected_condition: Mapped[str] = mapped_column(Text, default="")
    detected_condition: Mapped[str] = mapped_column(Text, default="")
    rule_reference: Mapped[str] = mapped_column(String(100), default="")
    inspector_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    inspection: Mapped["InspectionReport"] = relationship("InspectionReport", back_populates="findings")
