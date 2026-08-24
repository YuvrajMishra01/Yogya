from typing import List, Dict
from pydantic import BaseModel

class DashboardStatsOut(BaseModel):
    totalInspections: int
    compliantCount: int
    needsReviewCount: int
    nonCompliantCount: int
    inconclusiveCount: int
    complianceRate: float
    recentInspections: List[dict]
    violationCategories: Dict[str, int]
