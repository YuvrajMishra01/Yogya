# Phase 2 Stub - Modular Rule Engine Service Interface
class BaseRuleEngineService:
    async def evaluate(self, declarations: list) -> dict:
        raise NotImplementedError("Rule engine will be integrated in Phase 2 when compliance.ts is provided")

class StubRuleEngineService(BaseRuleEngineService):
    async def evaluate(self, declarations: list) -> dict:
        return {
            "overallStatus": "INCONCLUSIVE",
            "stats": {"totalChecked": len(declarations), "passed": 0, "needsReview": 0, "failed": 0},
            "findings": []
        }
