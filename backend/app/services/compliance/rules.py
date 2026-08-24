import re
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, ConfigDict

class ComplianceFindingResult(BaseModel):
    category: str
    category_number: str
    requirement: str
    status: str  # PASS | FAIL | REVIEW_REQUIRED
    severity: str  # Critical | Major | Minor | Advisory
    reason: str
    expected_condition: str
    detected_condition: str
    rule_reference: str
    extracted_value: str = ""
    confidence: str = "Review required"

    model_config = ConfigDict(from_attributes=True)

class ComplianceEvaluationResult(BaseModel):
    overall_status: str  # COMPLIANT | NEEDS REVIEW | NON-COMPLIANT | INCONCLUSIVE
    findings: List[ComplianceFindingResult]
    total_checked: int = 0
    passed_count: int = 0
    needs_review_count: int = 0
    failed_count: int = 0

    model_config = ConfigDict(from_attributes=True)

class ComplianceRuleEngine:
    """
    Deterministic rule engine for Legal Metrology Packaged Commodities Rules, 2011.
    Evaluates the 7 mandatory declaration categories against statutory requirements.
    Independent of database or external generative AI services.
    """

    MANDATORY_RULES = {
        "MANUFACTURER": {
            "category_number": "1",
            "aliases": ["manufacturer", "mfg_name", "MANUFACTURER"],
            "requirement": "Name and address of manufacturer/packer/importer",
            "rule_reference": "Rule 6(1)(a)",
            "severity": "Critical",
            "expected_condition": "Non-empty manufacturer or packer identity declaration",
        },
        "ADDRESS": {
            "category_number": "2",
            "aliases": ["address", "mfg_address", "ADDRESS"],
            "requirement": "Complete registered office or factory address",
            "rule_reference": "Rule 6(1)(a)",
            "severity": "Major",
            "expected_condition": "Non-empty premises or office location address",
        },
        "NET_QUANTITY": {
            "category_number": "3",
            "aliases": ["net_quantity", "net_qty", "NET_QUANTITY"],
            "requirement": "Net quantity in standard units of weight, measure, or number",
            "rule_reference": "Rule 6(1)(b)",
            "severity": "Critical",
            "expected_condition": "Numeric quantity accompanied by standard unit (g, kg, ml, l, pcs, N)",
        },
        "MRP": {
            "category_number": "4",
            "aliases": ["mrp", "price", "MRP"],
            "requirement": "Maximum Retail Price inclusive of all taxes",
            "rule_reference": "Rule 6(1)(e)",
            "severity": "Critical",
            "expected_condition": "Monetary value containing numeric amount and currency symbol (₹ / Rs)",
        },
        "MANUFACTURING_DATE": {
            "category_number": "5",
            "aliases": ["date_info", "mfg_date", "pkd_date", "MANUFACTURING_DATE"],
            "requirement": "Month and year of manufacture, packing, or import",
            "rule_reference": "Rule 6(1)(d)",
            "severity": "Major",
            "expected_condition": "Valid date, month/year, or packaging timestamp",
        },
        "CONSUMER_CARE": {
            "category_number": "6",
            "aliases": ["consumer_care", "customer_care", "CONSUMER_CARE"],
            "requirement": "Consumer grievance care details (name/phone/email)",
            "rule_reference": "Rule 6(1)(ac)",
            "severity": "Major",
            "expected_condition": "Valid phone number, email address, or toll-free helpline",
        },
        "COUNTRY_OF_ORIGIN": {
            "category_number": "7",
            "aliases": ["country_of_origin", "origin", "COUNTRY_OF_ORIGIN"],
            "requirement": "Country of origin statement for imported / manufactured products",
            "rule_reference": "Rule 6(1)(aa)",
            "severity": "Minor",
            "expected_condition": "Explicit country of origin declaration (e.g. Made in India / Product of India)",
        },
    }

    def evaluate_declarations(self, declarations: List[Any]) -> ComplianceEvaluationResult:
        """
        Evaluate a list of extracted declarations against Legal Metrology Rules.
        Accepts ExtractedDeclaration objects, DeclarationField ORM models, or dictionaries.
        """
        # Index declarations by standard category
        decl_map: Dict[str, Any] = {}
        for decl in declarations:
            if isinstance(decl, dict):
                cat = decl.get("category") or decl.get("field_type")
                val = decl.get("current_value") or decl.get("field_value") or decl.get("extracted_value") or ""
                conf = decl.get("confidence") or "Review required"
            else:
                cat = getattr(decl, "category", None) or getattr(decl, "field_type", None)
                val = getattr(decl, "current_value", None) or getattr(decl, "field_value", None) or getattr(decl, "extracted_value", None) or ""
                conf = getattr(decl, "confidence", "Review required") or "Review required"

            if cat:
                cat_upper = str(cat).upper()
                decl_map[cat_upper] = {
                    "value": str(val).strip(),
                    "confidence": str(conf),
                    "raw_obj": decl,
                }

        findings: List[ComplianceFindingResult] = []
        passed = 0
        needs_review = 0
        failed = 0

        for cat_key, meta in self.MANDATORY_RULES.items():
            # Find matching declaration by key or alias
            found_decl = decl_map.get(cat_key)
            if not found_decl:
                for alias in meta["aliases"]:
                    alias_upper = alias.upper()
                    if alias_upper in decl_map:
                        found_decl = decl_map[alias_upper]
                        break

            if not found_decl or not found_decl["value"]:
                findings.append(ComplianceFindingResult(
                    category=cat_key,
                    category_number=meta["category_number"],
                    requirement=meta["requirement"],
                    status="FAIL",
                    severity=meta["severity"],
                    reason=f"Mandatory declaration '{cat_key}' is missing or empty.",
                    expected_condition=meta["expected_condition"],
                    detected_condition="Declaration NOT DETECTED on package label.",
                    rule_reference=meta["rule_reference"],
                    extracted_value="",
                    confidence="Review required"
                ))
                failed += 1
            else:
                val = found_decl["value"]
                conf = found_decl["confidence"]
                is_valid, validation_msg = self._validate_field_rule(cat_key, val)

                # Determine status based on validity and confidence
                if is_valid:
                    if "Review required" in conf or "Low confidence" in conf or "0." in conf:
                        status = "REVIEW_REQUIRED"
                        reason = f"Extracted value matches rule pattern but OCR confidence requires inspector review ({conf})."
                        needs_review += 1
                    else:
                        status = "PASS"
                        reason = f"Compliant declaration verified according to {meta['rule_reference']}."
                        passed += 1
                else:
                    if "Review required" in conf or "Low confidence" in conf:
                        status = "REVIEW_REQUIRED"
                        reason = f"Ambiguous extracted value requires inspector verification: {validation_msg}."
                        needs_review += 1
                    else:
                        status = "FAIL"
                        reason = f"Non-compliant declaration format: {validation_msg}."
                        failed += 1

                findings.append(ComplianceFindingResult(
                    category=cat_key,
                    category_number=meta["category_number"],
                    requirement=meta["requirement"],
                    status=status,
                    severity=meta["severity"],
                    reason=reason,
                    expected_condition=meta["expected_condition"],
                    detected_condition=val,
                    rule_reference=meta["rule_reference"],
                    extracted_value=val,
                    confidence=conf
                ))

        total_checked = len(self.MANDATORY_RULES)

        # Overall Status Determination
        if failed > 0:
            overall = "NON-COMPLIANT"
        elif needs_review > 0:
            overall = "NEEDS REVIEW"
        elif passed == total_checked:
            overall = "COMPLIANT"
        else:
            overall = "INCONCLUSIVE"

        return ComplianceEvaluationResult(
            overall_status=overall,
            findings=findings,
            total_checked=total_checked,
            passed_count=passed,
            needs_review_count=needs_review,
            failed_count=failed,
        )

    def _validate_field_rule(self, category: str, value: str) -> tuple[bool, str]:
        """Validate value against specific Legal Metrology statutory rules."""
        if not value or len(value.strip()) < 1:
            return False, "Value is empty"

        val_lower = value.lower()

        if category == "MANUFACTURER":
            if len(value) >= 2:
                return True, "Valid manufacturer name"
            return False, "Manufacturer name too short"

        elif category == "ADDRESS":
            if len(value) >= 3:
                return True, "Valid address details"
            return False, "Address details too short"

        elif category == "NET_QUANTITY":
            # Check for numeric amount + unit
            match = re.search(r"[0-9\.]+\s*(?:g|kg|mg|ml|l|ltr|litres|liter|grams|grm|pcs|units|n)\b", val_lower)
            if match:
                return True, "Valid net quantity and standard unit"
            # Generic digit check
            if any(char.isdigit() for char in value):
                return True, "Contains quantity digits"
            return False, "Missing numeric quantity or standard unit"

        elif category == "MRP":
            # Check for numeric monetary value
            if any(char.isdigit() for char in value) and any(sym in value or sym in val_lower for sym in ["₹", "rs", "inr", "mrp", "price"]):
                return True, "Valid MRP monetary format"
            if any(char.isdigit() for char in value):
                return True, "Contains price digits"
            return False, "Missing numeric price amount or currency symbol"

        elif category == "MANUFACTURING_DATE":
            # Date/month-year pattern
            date_match = re.search(r"([0-9]{1,2}[\/\.\-][0-9]{2,4}|[a-z]{3,9}\s*[0-9]{2,4}|[0-9]{4})", val_lower)
            if date_match:
                return True, "Valid manufacturing/packing date format"
            return False, "Missing recognizable date or month-year pattern"

        elif category == "CONSUMER_CARE":
            # Phone, email, toll free number
            has_email = "@" in value
            has_phone = re.search(r"[0-9\-\+\s]{8,15}", value)
            has_care = any(k in val_lower for k in ["care", "customer", "help", "toll", "contact", "mail", "free"])
            if has_email or has_phone or has_care:
                return True, "Valid consumer grievance contact details"
            return False, "Missing phone number, email address, or helpline contact"

        elif category == "COUNTRY_OF_ORIGIN":
            if len(value) >= 2:
                return True, "Valid country of origin statement"
            return False, "Country of origin declaration too short"

        return True, "Valid"

# Global singleton instance
compliance_rule_engine = ComplianceRuleEngine()
