import uuid
from sqlalchemy import String, Text, Float, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class OCRTextRegionModel(Base):
    __tablename__ = "ocr_text_regions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id: Mapped[str] = mapped_column(String(36), ForeignKey("ocr_processing_jobs.id", ondelete="CASCADE"), index=True, nullable=False)
    inspection_id: Mapped[str] = mapped_column(String(36), ForeignKey("inspection_reports.id", ondelete="CASCADE"), index=True, nullable=False)
    evidence_image_id: Mapped[str] = mapped_column(String(36), ForeignKey("evidence_images.id", ondelete="CASCADE"), index=True, nullable=True)

    recognized_text: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    
    bbox_x: Mapped[int] = mapped_column(Integer, default=0)
    bbox_y: Mapped[int] = mapped_column(Integer, default=0)
    bbox_w: Mapped[int] = mapped_column(Integer, default=0)
    bbox_h: Mapped[int] = mapped_column(Integer, default=0)
    
    line_number: Mapped[int] = mapped_column(Integer, default=1)
    word_number: Mapped[int] = mapped_column(Integer, default=1)

    job: Mapped["OCRProcessingJob"] = relationship("OCRProcessingJob", back_populates="regions")
