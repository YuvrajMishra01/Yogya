from typing import List, Literal, Optional
from pydantic import BaseModel
from app.schemas.inspection import InspectionReportOut

class ProductSummaryStats(BaseModel):
    totalInspections: int = 0
    passed: int = 0
    needsReview: int = 0
    failed: int = 0

class ProductSampleImage(BaseModel):
    id: str
    previewUrl: str
    name: str

class ProductSummaryOut(BaseModel):
    id: str
    name: str
    manufacturer: str
    address: str
    netQuantity: str
    mrp: str
    countryOfOrigin: str
    consumerCare: str
    firstInspectedDate: str
    latestInspectionDate: str
    latestStatus: Literal['COMPLIANT', 'NEEDS REVIEW', 'NON-COMPLIANT', 'INCONCLUSIVE']
    inspections: List[InspectionReportOut]
    sampleImage: Optional[ProductSampleImage] = None
    stats: ProductSummaryStats
