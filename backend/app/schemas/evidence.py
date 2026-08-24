from typing import Optional
from pydantic import BaseModel, ConfigDict

class EvidenceImageBase(BaseModel):
    previewUrl: str
    name: str
    relatedRequirement: Optional[str] = None
    description: str = ""

class EvidenceImageIn(EvidenceImageBase):
    id: Optional[str] = None

class EvidenceImageOut(EvidenceImageBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
