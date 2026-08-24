import uuid
import time
from sqlalchemy import String, BigInteger, Text, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class OCRProcessingJob(Base):
    __tablename__ = "ocr_processing_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    inspection_id: Mapped[str] = mapped_column(String(36), ForeignKey("inspection_reports.id", ondelete="CASCADE"), index=True, nullable=False)
    
    status: Mapped[str] = mapped_column(String(50), default="pending", index=True)  # pending | processing | completed | failed
    engine_used: Mapped[str] = mapped_column(String(50), default="Tesseract OCR v5")
    progress: Mapped[float] = mapped_column(Float, default=0.0)
    processing_time_ms: Mapped[float] = mapped_column(Float, default=0.0)
    raw_text: Mapped[str] = mapped_column(Text, default="")
    average_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    error_message: Mapped[str] = mapped_column(Text, nullable=True)

    created_at: Mapped[int] = mapped_column(BigInteger, default=lambda: int(time.time() * 1000), index=True)
    updated_at: Mapped[int] = mapped_column(BigInteger, default=lambda: int(time.time() * 1000))

    inspection: Mapped["InspectionReport"] = relationship("InspectionReport", back_populates="ocr_jobs")
    regions: Mapped[list["OCRTextRegionModel"]] = relationship("OCRTextRegionModel", back_populates="job", cascade="all, delete-orphan", lazy="selectin")
