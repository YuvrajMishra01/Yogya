import uuid
from sqlalchemy import String, Text, Boolean, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class DeclarationField(Base):
    __tablename__ = "declaration_fields"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    inspection_id: Mapped[str] = mapped_column(String(36), ForeignKey("inspection_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    category_number: Mapped[str] = mapped_column(String(50), nullable=False)
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    statutory_rule_ref: Mapped[str] = mapped_column(String(100), default="")
    extracted_value: Mapped[str] = mapped_column(Text, default="")
    current_value: Mapped[str] = mapped_column(Text, default="")
    is_edited: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(50), default="NOT_DETECTED")  # DETECTED | NOT_DETECTED | REVIEW_REQUIRED
    confidence: Mapped[str] = mapped_column(String(50), default="Review required")
    evidence_image_index: Mapped[int] = mapped_column(Integer, default=0)
    ocr_region_id: Mapped[str] = mapped_column(String(36), ForeignKey("ocr_text_regions.id", ondelete="SET NULL"), nullable=True)

    inspection: Mapped["InspectionReport"] = relationship("InspectionReport", back_populates="declarations")
