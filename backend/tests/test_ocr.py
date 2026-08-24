import os
import tempfile
import pytest
import numpy as np
from PIL import Image, ImageDraw

from app.services.ocr.preprocessor import OCRPreprocessor
from app.services.ocr.tesseract import TesseractOCRService, RawOCRResult

@pytest.fixture
def sample_image_path():
    # Create temporary synthetic test image with text
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        img = Image.new("RGB", (400, 150), color=(255, 255, 255))
        d = ImageDraw.Draw(img)
        d.text((20, 20), "NET QTY: 500 g", fill=(0, 0, 0))
        d.text((20, 60), "MRP Rs 199.00", fill=(0, 0, 0))
        d.text((20, 100), "MFD BY: YOGYA FOODS", fill=(0, 0, 0))
        img.save(tmp.name)
        file_path = tmp.name

    yield file_path

    if os.path.exists(file_path):
        os.remove(file_path)

def test_ocr_preprocessor(sample_image_path):
    processed = OCRPreprocessor.preprocess_image(sample_image_path)
    assert isinstance(processed, np.ndarray)
    assert len(processed.shape) == 2  # Grayscale binarized image matrix
    assert processed.shape[0] == 150
    assert processed.shape[1] == 400

    deskewed = OCRPreprocessor.deskew_image(processed)
    assert isinstance(deskewed, np.ndarray)

@pytest.mark.asyncio
async def test_tesseract_ocr_service(sample_image_path):
    service = TesseractOCRService()
    result = await service.extract_text(sample_image_path, image_id="img-test-1")
    
    assert isinstance(result, RawOCRResult)
    assert result.image_id == "img-test-1"
    assert result.engine_name.startswith("Tesseract")
    assert isinstance(result.raw_text, str)
    assert isinstance(result.regions, list)
    assert len(result.regions) > 0
    assert result.average_confidence > 0.0

    # Verify first region bounding box coordinates
    first_region = result.regions[0]
    assert first_region.text != ""
    assert first_region.confidence >= 0.0
    assert first_region.bbox.x >= 0
    assert first_region.bbox.y >= 0
    assert first_region.bbox.width > 0
    assert first_region.bbox.height > 0

@pytest.mark.asyncio
async def test_tesseract_fallback_on_invalid_path(sample_image_path, monkeypatch):
    import pytesseract
    monkeypatch.setattr(pytesseract.pytesseract, "tesseract_cmd", "invalid_nonexistent_tesseract_path")
    service = TesseractOCRService()
    result = await service.extract_text(sample_image_path, image_id="img-fallback")
    
    assert isinstance(result, RawOCRResult)
    assert result.engine_name == "Tesseract v5 (Fallback)"
    assert result.raw_text == ""
    assert result.regions == []
    assert result.average_confidence == 0.0
