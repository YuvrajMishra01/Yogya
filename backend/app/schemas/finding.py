from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class ComplianceFindingBase(BaseModel):
    categoryNumber: str
    requirement: str
    status: str = "PASSED"
    severity: str = "Advisory"
    reason: str = ""
    expectedCondition: str = ""
    detectedCondition: str = ""
    ruleReference: str = ""
    inspectorNote: Optional[str] = None

class ComplianceFindingIn(ComplianceFindingBase):
    id: Optional[str] = None

class ComplianceFindingOut(ComplianceFindingBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
