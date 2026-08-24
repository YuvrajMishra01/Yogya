from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class OCRBoundingBoxSchema(BaseModel):
    x: int
    y: int
    width: int
    height: int

class OCRTextRegionSchema(BaseModel):
    id: str
    job_id: str
    inspection_id: str
    evidence_image_id: Optional[str] = None
    recognized_text: str
    confidence: float
    bbox: OCRBoundingBoxSchema
    line_number: int
    word_number: int

    model_config = ConfigDict(from_attributes=True)

class OCRJobStatusResponse(BaseModel):
    id: str
    job_id: str
    inspection_id: str
    status: str  # pending | processing | completed | failed
    engine_used: str
    progress: float
    processing_time_ms: float
    error_message: Optional[str] = None
    created_at: int
    updated_at: int

    model_config = ConfigDict(from_attributes=True)

class OCRResultsResponse(BaseModel):
    id: str
    job_id: str
    inspection_id: str
    status: str
    raw_text: str
    average_confidence: float
    processing_time_ms: float
    regions: List[OCRTextRegionSchema]
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
