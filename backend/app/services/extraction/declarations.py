import re
from typing import List, Optional, Dict, Tuple
from pydantic import BaseModel, ConfigDict
from app.services.ocr.base import OCRTextRegion, RawOCRResult, OCRBoundingBox

class ExtractedDeclaration(BaseModel):
    field_type: str  # manufacturer | address | net_quantity | mrp | date_info | consumer_care | country_of_origin
    field_value: str  # Normalized value
    raw_text: str  # Original OCR raw text fragment
    confidence: float = 0.0  # Confidence score (0.0 - 100.0)
    ocr_region_id: Optional[str] = None  # Primary source region ID
    source_region_ids: List[str] = []  # All contributing region IDs
    bbox: Optional[OCRBoundingBox] = None  # Bounding box
    matched_pattern: Optional[str] = None  # Matched regex/pattern name
    status: str = "EXTRACTED"  # EXTRACTED | AMBIGUOUS | NOT_FOUND

    model_config = ConfigDict(from_attributes=True)

class ExtractionResult(BaseModel):
    image_id: Optional[str] = None
    extracted_declarations: List[ExtractedDeclaration]
    unmatched_text_fragments: List[str] = []

    model_config = ConfigDict(from_attributes=True)

class DeclarationExtractor:
    """
    Pure deterministic rule-based Legal Metrology declaration extractor.
    Operates on OCRTextRegion models and RawOCRResult objects.
    Independent of database, FastAPI, or external AI services.
    """

    PATTERNS: Dict[str, List[Tuple[str, str]]] = {
        "mrp": [
            ("mrp_explicit", r"(?i)(?:m\.?r\.?p\.?|i\.?r\.?p\.?|maximum\s+retail\s+price|incl\.?\s*of\s*all\s*taxes)\s*[:\-\s]*([₹Rs\.\s]*[0-9]+(?:\.[0-9]{1,2})?)"),
            ("mrp_symbol", r"(?i)(?:mrp|m\.r\.p|irp|price)\s*[:\-\s]*[₹Rs\.]*\s*([0-9]+\.?[0-9]*)"),
        ],
        "net_quantity": [
            ("net_qty_explicit", r"(?i)(?:net\s*(?:qty|quantity|wt|weight)|quantity|net\s*content|contents)\s*[:\-\s]*([0-9\.]+\s*(?:g|kg|ml|l|ltr|litres|grams|grm|pcs|units|n))\b"),
            ("net_qty_generic", r"(?i)\b(?:net\s*(?:qty|quantity|wt|weight)|quantity)\s*[:\-\s]*([0-9\.]+\s*[A-Za-z]+)\b"),
            ("net_qty_standalone", r"(?i)\b([0-9]+(?:\.[0-9]+)?\s*(?:g|kg|ml|l|ltr|litres|grams|grm|pcs|units|N))\b"),
        ],
        "date_info": [
            ("mfg_date_explicit", r"(?i)(?:mfg|mfd|manufactured|manufacturing|pkd|packed|date\s*of\s*mfg|date\s*of\s*manufacture)(?:\s*date)?(?:\s*on)?\s*[:\-\s]*([0-9]{1,2}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{2,4}|[0-9]{1,2}[\/\.\-][0-9]{2,4}|[A-Za-z]{3,9}\s*[\.\-]?\s*[0-9]{2,4})"),
            ("date_month_year", r"(?i)\b(?:mfg|mfd|pkd|packed)\s*[:\-\s]*([A-Za-z]{3,9}\s*[0-9]{2,4})\b"),
            ("date_standalone_slash", r"(?i)\b([0-1]?[0-9][\/\.][2-9][0-9])\b"),
        ],
        "country_of_origin": [
            ("country_explicit", r"(?i)(?:country\s*of\s*origin|made\s*in|country\s*of\s*manufacture|product\s*of)\s*[:\-\s]*([A-Za-z\s]{2,30})"),
        ],
        "consumer_care": [
            ("consumer_care_explicit", r"(?i)(?:consumer\s*care|customer\s*care|customer\s*service|toll\s*free|helpline|contact\s*us|feedback|queries|website)\s*[:\-\s]*([A-Za-z0-9\.\,\s@\-\+\:\(\)/]+)"),
            ("phone_email_care", r"(?i)(?:toll\s*free|call|phone|email|mail)\s*[:\-\s]*([A-Za-z0-9\.\_\%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}|[0-9\-\+\s]{8,15})"),
            ("url_care", r"(?i)\b(www\.[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}|[A-Za-z0-9\.\-]{3,}\.(?:in|com|org|net))\b"),
        ],
        "manufacturer": [
            ("mfg_name_explicit", r"(?i)(?:manufactured\s*(?:&|and)?\s*packed\s*by|manufactured\s*(?:&|and)?\s*marketed\s*by|manufactured\s*by|mfd\s*by|mfg\s*by|packed\s*by|imported\s*by|marketed\s*by)\s*[:\-\s]*([^\n\r,]+(?:,\s*[^\n\r,]+)?)"),
            ("brand_name", r"(?i)\b(myfitness|nescafe|nestle|kissan)\b"),
        ],
        "address": [
            ("address_explicit", r"(?i)(?:factory\s*address|regd\.?\s*office|registered\s*office|address|works|plant|unit)\s*[:\-\s]*([^\n\r]+)"),
            ("address_keywords", r"(?i)\b(?:plot|road|street|phase|industrial\s*area|pincode|pin|district|dist|state|sector)\s*[:\-\s]*([^\n\r]+)"),
        ],
    }

    def extract_from_ocr_result(self, ocr_result: RawOCRResult) -> ExtractionResult:
        """Extract declarations from a complete RawOCRResult."""
        return self.extract_from_regions(ocr_result.regions, raw_text=ocr_result.raw_text, image_id=ocr_result.image_id)

    def extract_from_regions(
        self,
        regions: List[OCRTextRegion],
        raw_text: str = "",
        image_id: Optional[str] = None
    ) -> ExtractionResult:
        """Extract declarations from a list of OCRTextRegion objects."""
        extracted: List[ExtractedDeclaration] = []
        found_fields = set()

        # Step 1: Scan individual regions (filter out short noise regions)
        valid_regions = [r for r in regions if len(r.text.strip()) >= 2 and r.confidence >= 15.0]
        for region in valid_regions:
            text = region.text.strip()
            extracted_item = self._extract_single_text(
                text=text,
                region_id=region.region_id,
                confidence=region.confidence,
                bbox=region.bbox
            )
            if extracted_item and extracted_item.field_type not in found_fields:
                extracted.append(extracted_item)
                found_fields.add(extracted_item.field_type)

        # Step 2: Group regions by line_number for multi-word line analysis
        lines_map: Dict[int, List[OCRTextRegion]] = {}
        for region in valid_regions:
            lines_map.setdefault(region.line_number, []).append(region)

        sorted_line_numbers = sorted(lines_map.keys())
        for line_num in sorted_line_numbers:
            line_regions = lines_map[line_num]
            line_text = " ".join(r.text for r in line_regions).strip()
            line_region_ids = [r.region_id for r in line_regions if r.region_id]
            avg_conf = sum(r.confidence for r in line_regions) / len(line_regions) if line_regions else 0.0
            primary_region_id = line_region_ids[0] if line_region_ids else None
            primary_bbox = line_regions[0].bbox if line_regions else None

            extracted_item = self._extract_single_text(
                text=line_text,
                region_id=primary_region_id,
                confidence=avg_conf,
                bbox=primary_bbox,
                source_region_ids=line_region_ids
            )
            if extracted_item and extracted_item.field_type not in found_fields:
                extracted.append(extracted_item)
                found_fields.add(extracted_item.field_type)

        # Step 3: Global combined raw text fallback
        combined_text = raw_text or " ".join(r.text for r in valid_regions)
        if combined_text:
            for field_type in self.PATTERNS.keys():
                if field_type not in found_fields:
                    item = self._extract_field_from_text(combined_text, field_type)
                    if item:
                        extracted.append(item)
                        found_fields.add(field_type)

        return ExtractionResult(
            image_id=image_id,
            extracted_declarations=extracted,
            unmatched_text_fragments=[]
        )

    def extract_from_text(self, text: str) -> ExtractionResult:
        """Extract declarations from a single block of raw text."""
        extracted: List[ExtractedDeclaration] = []
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        found_fields = set()

        for line in lines:
            extracted_item = self._extract_single_text(line)
            if extracted_item and extracted_item.field_type not in found_fields:
                extracted.append(extracted_item)
                found_fields.add(extracted_item.field_type)

        # Full block fallback
        for field_type in self.PATTERNS.keys():
            if field_type not in found_fields:
                item = self._extract_field_from_text(text, field_type)
                if item:
                    extracted.append(item)
                    found_fields.add(field_type)

        return ExtractionResult(extracted_declarations=extracted)

    def _extract_single_text(
        self,
        text: str,
        region_id: Optional[str] = None,
        confidence: float = 0.0,
        bbox: Optional[OCRBoundingBox] = None,
        source_region_ids: Optional[List[str]] = None
    ) -> Optional[ExtractedDeclaration]:
        for field_type in self.PATTERNS.keys():
            item = self._extract_field_from_text(
                text=text,
                field_type=field_type,
                region_id=region_id,
                confidence=confidence,
                bbox=bbox,
                source_region_ids=source_region_ids
            )
            if item:
                return item
        return None

    def _extract_field_from_text(
        self,
        text: str,
        field_type: str,
        region_id: Optional[str] = None,
        confidence: float = 0.0,
        bbox: Optional[OCRBoundingBox] = None,
        source_region_ids: Optional[List[str]] = None
    ) -> Optional[ExtractedDeclaration]:
        patterns = self.PATTERNS.get(field_type, [])
        for pattern_name, regex in patterns:
            match = re.search(regex, text)
            if match:
                extracted_val = match.group(1).strip() if match.groups() else match.group(0).strip()
                normalized_val = self._normalize_value(field_type, extracted_val)

                # Strict validation check to reject garbage noise false positives
                is_valid = self._validate_extracted_field(field_type, pattern_name, normalized_val, text)
                if not is_valid:
                    continue

                status = "EXTRACTED"
                if confidence > 0 and confidence < 45.0:
                    status = "AMBIGUOUS"

                pattern_weight = 80.0 if "explicit" in pattern_name or "brand" in pattern_name else 60.0
                decl_conf = round(confidence, 1) if confidence > 0 else pattern_weight

                s_ids = source_region_ids or ([region_id] if region_id else [])

                return ExtractedDeclaration(
                    field_type=field_type,
                    field_value=normalized_val,
                    raw_text=text,
                    confidence=decl_conf,
                    ocr_region_id=region_id,
                    source_region_ids=s_ids,
                    bbox=bbox,
                    matched_pattern=pattern_name,
                    status=status
                )
        return None

    def _validate_extracted_field(self, field_type: str, pattern_name: str, val: str, raw_text: str) -> bool:
        """Strict validation rules to prevent OCR noise fragments from becoming false positive declarations."""
        if not val or len(val.strip()) < 2:
            return False

        if field_type == "consumer_care":
            # Reject partial domain fragments like "ss.in", "a.com" where domain before TLD < 3 chars unless preceded by www or @
            if "@" in val:
                return bool(re.match(r"^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$", val))
            if "www." in val.lower():
                return len(val) >= 7
            # Domain prefix check for urls
            if "." in val and not "@" in val:
                domain_part = val.split(".")[0]
                if len(domain_part) < 3 and not "www" in domain_part.lower():
                    return False
            # If plain text care, require minimum length or explicit care phrase
            if not any(k in raw_text.lower() for k in ["care", "customer", "contact", "helpline", "email", "website", "www", "@"]):
                return False

        elif field_type == "address":
            # Require explicit address keywords or pincode/district context and min length
            if len(val) < 8:
                return False
            address_kw = ["road", "street", "plot", "phase", "area", "pincode", "pin", "dist", "state", "office", "factory", "plant", "unit", "sector", "building", "floor", "nagar", "marg"]
            if not any(k in raw_text.lower() for k in address_kw):
                return False

        elif field_type == "net_quantity":
            # Require valid numeric quantity with unit
            if not re.search(r"[0-9]+(?:\.[0-9]+)?\s*(?:g|kg|ml|l|ltr|litres|grams|pcs|units|n)", val, re.IGNORECASE):
                return False

        elif field_type == "mrp":
            # Must contain numeric price > 0
            num_match = re.search(r"[0-9]+(?:\.[0-9]{1,2})?", val)
            if not num_match or float(num_match.group(0)) <= 0:
                return False

        elif field_type == "date_info":
            # Must contain recognizable date numbers
            if not re.search(r"[0-9]{2,4}", val):
                return False

        return True

    def _normalize_value(self, field_type: str, raw_val: str) -> str:
        val = raw_val.strip()
        if field_type == "mrp":
            clean = re.sub(r"(?i)[^0-9\.]", "", val).lstrip(".")
            if clean:
                return f"₹{clean}"
            return val
        elif field_type == "net_quantity":
            match = re.search(r"([0-9\.]+)\s*([A-Za-z]+)", val)
            if match:
                num, unit = match.groups()
                return f"{num} {unit.lower()}"
            return val
        elif field_type == "date_info":
            return re.sub(r"[\s]+", " ", val).strip()
        elif field_type == "country_of_origin":
            return val.title()
        return val

# Global instance
declaration_extractor = DeclarationExtractor()
