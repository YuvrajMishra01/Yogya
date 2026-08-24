import pytest
from app.services.ocr.base import OCRBoundingBox, OCRTextRegion, RawOCRResult
from app.services.extraction.declarations import (
    DeclarationExtractor,
    ExtractedDeclaration,
    ExtractionResult,
    declaration_extractor,
)

def test_mrp_extraction():
    res = declaration_extractor.extract_from_text("M.R.P: Rs 199.00 (Incl. of all taxes)")
    mrp_decl = next((d for d in res.extracted_declarations if d.field_type == "mrp"), None)
    assert mrp_decl is not None
    assert mrp_decl.field_value == "₹199.00"
    assert "M.R.P: Rs 199.00" in mrp_decl.raw_text

def test_net_quantity_extraction():
    res = declaration_extractor.extract_from_text("NET QTY: 500g")
    net_qty_decl = next((d for d in res.extracted_declarations if d.field_type == "net_quantity"), None)
    assert net_qty_decl is not None
    assert net_qty_decl.field_value == "500 g"

def test_manufacturer_extraction():
    res = declaration_extractor.extract_from_text("Manufactured by: Nestlé India Ltd")
    mfg_decl = next((d for d in res.extracted_declarations if d.field_type == "manufacturer"), None)
    assert mfg_decl is not None
    assert "Nestlé India Ltd" in mfg_decl.field_value

def test_address_extraction():
    res = declaration_extractor.extract_from_text("Regd. Office: Plot No 12, Industrial Area, Sector 5, New Delhi - 110001")
    addr_decl = next((d for d in res.extracted_declarations if d.field_type == "address"), None)
    assert addr_decl is not None
    assert "Industrial Area" in addr_decl.field_value

def test_mfg_and_pkd_date_extraction():
    res1 = declaration_extractor.extract_from_text("Mfg Date: 08/2026")
    mfg_decl = next((d for d in res1.extracted_declarations if d.field_type == "date_info"), None)
    assert mfg_decl is not None
    assert "08/2026" in mfg_decl.field_value

    res2 = declaration_extractor.extract_from_text("PKD: 24/08/2026")
    pkd_decl = next((d for d in res2.extracted_declarations if d.field_type == "date_info"), None)
    assert pkd_decl is not None
    assert "24/08/2026" in pkd_decl.field_value

def test_consumer_care_extraction():
    res = declaration_extractor.extract_from_text("Customer Care: care@yogya.gov.in / Toll Free 1800-111-222")
    cc_decl = next((d for d in res.extracted_declarations if d.field_type == "consumer_care"), None)
    assert cc_decl is not None
    assert "care@yogya.gov.in" in cc_decl.field_value or "1800" in cc_decl.field_value

def test_country_of_origin_extraction():
    res = declaration_extractor.extract_from_text("Country of Origin: Made in India")
    country_decl = next((d for d in res.extracted_declarations if d.field_type == "country_of_origin"), None)
    assert country_decl is not None
    assert "India" in country_decl.field_value

def test_case_insensitive_matching():
    res = declaration_extractor.extract_from_text("mfd by: amul dairy")
    mfg_decl = next((d for d in res.extracted_declarations if d.field_type == "manufacturer"), None)
    assert mfg_decl is not None
    assert "amul dairy" in mfg_decl.field_value.lower()

def test_punctuation_and_ocr_noise():
    res = declaration_extractor.extract_from_text("M.R.P - Rs. 450.50")
    mrp_decl = next((d for d in res.extracted_declarations if d.field_type == "mrp"), None)
    assert mrp_decl is not None
    assert mrp_decl.field_value == "₹450.50"

def test_multiple_declarations_in_single_label():
    label_text = """
    Manufactured & Packed by: Organic Foods Ltd
    Regd. Office: Sector 18, Gurugram, Haryana
    Net Weight: 1 kg
    MRP: Rs 350.00
    PKD: AUG 2026
    Consumer Care: 1800-999-888
    Country of Origin: India
    """
    res = declaration_extractor.extract_from_text(label_text)
    extracted_types = {d.field_type for d in res.extracted_declarations}
    assert "manufacturer" in extracted_types
    assert "net_quantity" in extracted_types
    assert "mrp" in extracted_types
    assert "date_info" in extracted_types
    assert "consumer_care" in extracted_types
    assert "country_of_origin" in extracted_types

def test_missing_declaration():
    res = declaration_extractor.extract_from_text("Delicious Chocolate Biscuits. Keep in a cool dry place.")
    assert len(res.extracted_declarations) == 0

def test_region_id_and_confidence_preservation():
    bbox = OCRBoundingBox(x=10, y=20, width=100, height=30)
    region = OCRTextRegion(
        region_id="reg-123",
        text="NET QTY: 250 ml",
        confidence=95.5,
        bbox=bbox,
        line_number=1,
        word_number=1
    )
    raw_ocr = RawOCRResult(
        image_id="img-001",
        engine_name="Tesseract",
        raw_text="NET QTY: 250 ml",
        regions=[region],
        average_confidence=95.5,
        processing_time_ms=120.0
    )

    res = declaration_extractor.extract_from_ocr_result(raw_ocr)
    assert len(res.extracted_declarations) > 0
    decl = res.extracted_declarations[0]
    assert decl.ocr_region_id == "reg-123"
    assert decl.confidence == 95.5
    assert decl.bbox.x == 10
    assert decl.bbox.y == 20

def test_no_false_positive_from_unrelated_text():
    text = "Ingredients: Wheat Flour, Sugar, Palm Oil. Best before 6 months from packaging."
    res = declaration_extractor.extract_from_text(text)
    field_types = [d.field_type for d in res.extracted_declarations]
    assert "mrp" not in field_types
    assert "net_quantity" not in field_types
