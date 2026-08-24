# Phase 2 Stub - Modular OCR Service Interface
class BaseOCRService:
    async def extract_text(self, image_path: str) -> str:
        raise NotImplementedError("OCR service will be implemented in Phase 2")

class StubOCRService(BaseOCRService):
    async def extract_text(self, image_path: str) -> str:
        return "Phase 1 Stub - OCR Extraction Pending Phase 2"
