# Phase 3 Stub - Modular OpenCV Font Readability Analysis Interface
class BaseFontAnalysisService:
    async def analyze_font_sizes(self, image_path: str, net_quantity_slab: str) -> list:
        raise NotImplementedError("OpenCV Font Analysis will be implemented in Phase 3")

class StubFontAnalysisService(BaseFontAnalysisService):
    async def analyze_font_sizes(self, image_path: str, net_quantity_slab: str) -> list:
        return []
