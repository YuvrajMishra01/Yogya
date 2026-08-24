from typing import List, Literal, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.declaration import DeclarationFieldIn, DeclarationFieldOut
from app.schemas.finding import ComplianceFindingIn, ComplianceFindingOut
from app.schemas.evidence import EvidenceImageIn, EvidenceImageOut

class StatsSchema(BaseModel):
    totalChecked: int = 0
    passed: int = 0
    needsReview: int = 0
    failed: int = 0

class ReviewConfirmationSchema(BaseModel):
    declarationsReviewed: bool = False
    evidenceReviewed: bool = False
    complianceReviewed: bool = False
    inspectorConfirmed: bool = False

class InspectionReportIn(BaseModel):
    referenceNumber: Optional[str] = None
    inspectionDate: Optional[str] = None
    status: Literal['Draft', 'Under Review', 'Completed'] = 'Draft'
    
    productName: str = ""
    manufacturer: str = ""
    address: str = ""
    netQuantity: str = ""
    mrp: str = ""
    dateInfo: str = ""
    consumerCare: str = ""
    countryOfOrigin: str = ""
    otherDeclarations: str = ""

    declarations: List[DeclarationFieldIn] = Field(default_factory=list)
    overallStatus: Literal['COMPLIANT', 'NEEDS REVIEW', 'NON-COMPLIANT', 'INCONCLUSIVE'] = 'INCONCLUSIVE'
    stats: StatsSchema = Field(default_factory=StatsSchema)
    findings: List[ComplianceFindingIn] = Field(default_factory=list)
    evidenceImages: List[EvidenceImageIn] = Field(default_factory=list)
    observations: str = ""
    reviewConfirmation: ReviewConfirmationSchema = Field(default_factory=ReviewConfirmationSchema)

class InspectionReportPatch(BaseModel):
    status: Optional[Literal['Draft', 'Under Review', 'Completed']] = None
    productName: Optional[str] = None
    manufacturer: Optional[str] = None
    address: Optional[str] = None
    netQuantity: Optional[str] = None
    mrp: Optional[str] = None
    dateInfo: Optional[str] = None
    consumerCare: Optional[str] = None
    countryOfOrigin: Optional[str] = None
    otherDeclarations: Optional[str] = None
    declarations: Optional[List[DeclarationFieldIn]] = None
    overallStatus: Optional[Literal['COMPLIANT', 'NEEDS REVIEW', 'NON-COMPLIANT', 'INCONCLUSIVE']] = None
    stats: Optional[StatsSchema] = None
    findings: Optional[List[ComplianceFindingIn]] = None
    observations: Optional[str] = None
    reviewConfirmation: Optional[ReviewConfirmationSchema] = None

class InspectionReportOut(BaseModel):
    id: str
    referenceNumber: str
    inspectionDate: str
    createdAt: int
    status: Literal['Draft', 'Under Review', 'Completed']
    
    productName: str
    manufacturer: str
    address: str
    netQuantity: str
    mrp: str
    dateInfo: str
    consumerCare: str
    countryOfOrigin: str
    otherDeclarations: str

    declarations: List[DeclarationFieldOut]
    overallStatus: Literal['COMPLIANT', 'NEEDS REVIEW', 'NON-COMPLIANT', 'INCONCLUSIVE']
    stats: StatsSchema
    findings: List[ComplianceFindingOut]
    evidenceImages: List[EvidenceImageOut]
    observations: str
    reviewConfirmation: ReviewConfirmationSchema

    model_config = ConfigDict(from_attributes=True)
