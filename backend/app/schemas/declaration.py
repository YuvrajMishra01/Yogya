from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class DeclarationFieldBase(BaseModel):
    category: str
    categoryNumber: str
    label: str
    description: str = ""
    statutoryRuleRef: str = ""
    extractedValue: str = ""
    currentValue: str = ""
    isEdited: bool = False
    status: str = 'NOT_DETECTED'
    confidence: str = 'Review required'
    evidenceImageIndex: int = 0

class DeclarationFieldIn(DeclarationFieldBase):
    id: Optional[str] = None

class DeclarationFieldOut(DeclarationFieldBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
