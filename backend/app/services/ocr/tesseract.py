import os
import shutil
import time
import uuid
from typing import List
from PIL import Image
import pytesseract

from app.services.ocr.base import (
    BaseOCRService,
    RawOCRResult,
    OCRTextRegion,
    OCRBoundingBox,
)
from app.services.ocr.preprocessor import OCRPreprocessor

# Centralized Tesseract Executable Auto-Detection
TESSERACT_DEFAULT_WIN_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def configure_tesseract_path():
    env_path = os.environ.get("TESSERACT_CMD")
    if env_path and os.path.exists(env_path):
        pytesseract.pytesseract.tesseract_cmd = env_path
    elif not shutil.which("tesseract") and os.path.exists(TESSERACT_DEFAULT_WIN_PATH):
        pytesseract.pytesseract.tesseract_cmd = TESSERACT_DEFAULT_WIN_PATH

configure_tesseract_path()

class TesseractOCRService(BaseOCRService):
    """
    Tesseract OCR Service Implementation using pytesseract.image_to_data
    Extracts spatial text bounding boxes, confidence ratings, and line metadata.
    """
    def __init__(self, lang: str = "eng"):
        self.lang = lang

    def _run_single_pass(
        self,
        pil_img: Image.Image,
        image_id: str,
        start_time: float,
        pass_name: str,
        config: str = ""
    ) -> RawOCRResult:
        try:
            data = pytesseract.image_to_data(
                pil_img,
                lang=self.lang,
                config=config,
                output_type=pytesseract.Output.DICT
            )
        except Exception:
            return RawOCRResult(
                image_id=image_id,
                engine_name="Tesseract v5 (Fallback)",
                raw_text="",
                regions=[],
                average_confidence=0.0,
                processing_time_ms=(time.time() - start_time) * 1000,
                language_detected=self.lang,
            )

        regions: List[OCRTextRegion] = []
        full_text_parts: List[str] = []
        total_conf = 0.0
        conf_count = 0

        n_boxes = len(data.get("text", []))
        for i in range(n_boxes):
            text_val = data["text"][i].strip()
            conf_val = float(data["conf"][i]) if "conf" in data and data["conf"][i] != "-1" else 0.0

            if text_val:
                full_text_parts.append(text_val)
                if conf_val > 0:
                    total_conf += conf_val
                    conf_count += 1

                region = OCRTextRegion(
                    region_id=str(uuid.uuid4()),
                    text=text_val,
                    confidence=conf_val,
                    bbox=OCRBoundingBox(
                        x=int(data["left"][i]),
                        y=int(data["top"][i]),
                        width=int(data["width"][i]),
                        height=int(data["height"][i]),
                    ),
                    line_number=int(data["line_num"][i]),
                    word_number=int(data["word_num"][i]),
                )
                regions.append(region)

        raw_text = " ".join(full_text_parts)
        avg_conf = round(total_conf / conf_count, 1) if conf_count > 0 else 0.0
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return RawOCRResult(
            image_id=image_id,
            engine_name=f"Tesseract OCR v5 ({pass_name})",
            raw_text=raw_text,
            regions=regions,
            average_confidence=avg_conf,
            processing_time_ms=elapsed_ms,
            language_detected=self.lang,
        )

    def _score_ocr_result(self, result: RawOCRResult) -> float:
        """Deterministic scoring based on word count, confidence, and key statutory terms."""
        words = [w for w in result.raw_text.split() if len(w) > 1]
        word_count = len(words)
        if word_count == 0:
            return 0.0

        statutory_keywords = {
            "net", "qty", "quantity", "mrp", "mfd", "mfg", "pkd", "packed", "date",
            "rs", "price", "retail", "incl", "taxes", "care", "email", "address",
            "manufactured", "marketed", "india", "origin", "g", "kg", "ml", "l", "pcs"
        }
        keyword_hits = sum(1 for w in words if w.lower().strip(".:,;-/") in statutory_keywords)

        return (word_count * 10.0) + (keyword_hits * 25.0) + (result.average_confidence * 0.5)

    async def extract_text(self, image_path: str, image_id: str = "") -> RawOCRResult:
        start_time = time.time()

        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Evidence image not found: {image_path}")

        candidates: List[RawOCRResult] = []

        # Pass 1: Preprocessed CLAHE Grayscale image (--psm 6)
        try:
            processed_matrix = OCRPreprocessor.preprocess_image(image_path)
            processed_matrix = OCRPreprocessor.deskew_image(processed_matrix)
            pil_p1 = Image.fromarray(processed_matrix)
            res1 = self._run_single_pass(pil_p1, image_id, start_time, "CLAHE Grayscale", config="--psm 6")
            candidates.append(res1)
        except Exception:
            pass

        # Pass 2: Raw RGB image (--psm 11 sparse text)
        try:
            pil_p2 = Image.open(image_path).convert("RGB")
            res2 = self._run_single_pass(pil_p2, image_id, start_time, "Raw RGB Sparse", config="--psm 11")
            candidates.append(res2)
        except Exception:
            pass

        # Pass 3: Raw RGB image (--psm 6 uniform block)
        try:
            pil_p3 = Image.open(image_path).convert("RGB")
            res3 = self._run_single_pass(pil_p3, image_id, start_time, "Raw RGB Block", config="--psm 6")
            candidates.append(res3)
        except Exception:
            pass

        if not candidates:
            return RawOCRResult(
                image_id=image_id,
                engine_name="Tesseract OCR v5 (Empty)",
                raw_text="",
                regions=[],
                average_confidence=0.0,
                processing_time_ms=(time.time() - start_time) * 1000,
                language_detected=self.lang,
            )

        # Select candidate with highest deterministic score
        best_candidate = max(candidates, key=self._score_ocr_result)
        return best_candidate

tesseract_ocr_service = TesseractOCRService()
