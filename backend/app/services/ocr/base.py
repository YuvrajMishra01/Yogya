from typing import List, Optional
from pydantic import BaseModel

class OCRBoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int

class OCRTextRegion(BaseModel):
    region_id: str
    text: str
    confidence: float
    bbox: OCRBoundingBox
    line_number: int
    word_number: int

class RawOCRResult(BaseModel):
    image_id: str
    engine_name: str
    raw_text: str
    regions: List[OCRTextRegion]
    average_confidence: float
    processing_time_ms: float
    language_detected: Optional[str] = "eng"

class BaseOCRService:
    async def extract_text(self, image_path: str, image_id: str = "") -> RawOCRResult:
        raise NotImplementedError("Subclasses must implement extract_text")
