import pytest
from app.services.compliance.rules import compliance_rule_engine, ComplianceRuleEngine, ComplianceFindingResult

def test_manufacturer_rule_evaluation():
    # Valid Manufacturer
    decls_pass = [{"category": "MANUFACTURER", "current_value": "Nestlé India Ltd", "confidence": "High confidence"}]
    res_pass = compliance_rule_engine.evaluate_declarations(decls_pass)
    mfg_finding = next(f for f in res_pass.findings if f.category == "MANUFACTURER")
    assert mfg_finding.status == "PASS"
    assert "Nestlé India Ltd" in mfg_finding.extracted_value

    # Missing Manufacturer
    res_fail = compliance_rule_engine.evaluate_declarations([])
    mfg_finding_fail = next(f for f in res_fail.findings if f.category == "MANUFACTURER")
    assert mfg_finding_fail.status == "FAIL"

def test_address_rule_evaluation():
    # Valid Address
    decls_pass = [{"category": "ADDRESS", "current_value": "Plot 12, Industrial Area, Gurgaon", "confidence": "High confidence"}]
    res_pass = compliance_rule_engine.evaluate_declarations(decls_pass)
    addr_finding = next(f for f in res_pass.findings if f.category == "ADDRESS")
    assert addr_finding.status == "PASS"

    # Missing Address
    res_fail = compliance_rule_engine.evaluate_declarations([])
    addr_finding_fail = next(f for f in res_fail.findings if f.category == "ADDRESS")
    assert addr_finding_fail.status == "FAIL"

def test_net_quantity_rule_evaluation():
    # "500 g"
    decls_g = [{"category": "NET_QUANTITY", "current_value": "500 g", "confidence": "High confidence"}]
    res_g = compliance_rule_engine.evaluate_declarations(decls_g)
    assert next(f for f in res_g.findings if f.category == "NET_QUANTITY").status == "PASS"

    # "1 kg"
    decls_kg = [{"category": "NET_QUANTITY", "current_value": "1 kg", "confidence": "High confidence"}]
    res_kg = compliance_rule_engine.evaluate_declarations(decls_kg)
    assert next(f for f in res_kg.findings if f.category == "NET_QUANTITY").status == "PASS"

    # Invalid net quantity
    decls_inv = [{"category": "NET_QUANTITY", "current_value": "Unknown Quantity", "confidence": "High confidence"}]
    res_inv = compliance_rule_engine.evaluate_declarations(decls_inv)
    assert next(f for f in res_inv.findings if f.category == "NET_QUANTITY").status in ["FAIL", "REVIEW_REQUIRED"]

def test_mrp_rule_evaluation():
    # "₹199"
    decls_inr = [{"category": "MRP", "current_value": "₹199.00", "confidence": "High confidence"}]
    res_inr = compliance_rule_engine.evaluate_declarations(decls_inr)
    assert next(f for f in res_inr.findings if f.category == "MRP").status == "PASS"

    # "Rs 199"
    decls_rs = [{"category": "MRP", "current_value": "Rs 199", "confidence": "High confidence"}]
    res_rs = compliance_rule_engine.evaluate_declarations(decls_rs)
    assert next(f for f in res_rs.findings if f.category == "MRP").status == "PASS"

    # "INR 199"
    decls_inr_text = [{"category": "MRP", "current_value": "INR 199", "confidence": "High confidence"}]
    res_inr_text = compliance_rule_engine.evaluate_declarations(decls_inr_text)
    assert next(f for f in res_inr_text.findings if f.category == "MRP").status == "PASS"

    # Invalid MRP
    decls_inv = [{"category": "MRP", "current_value": "Free Sample Not For Sale", "confidence": "High confidence"}]
    res_inv = compliance_rule_engine.evaluate_declarations(decls_inv)
    assert next(f for f in res_inv.findings if f.category == "MRP").status in ["FAIL", "REVIEW_REQUIRED"]

def test_mfg_date_rule_evaluation():
    # "MFG: 08/2026"
    decls_mfg = [{"category": "MANUFACTURING_DATE", "current_value": "MFG: 08/2026", "confidence": "High confidence"}]
    res_mfg = compliance_rule_engine.evaluate_declarations(decls_mfg)
    assert next(f for f in res_mfg.findings if f.category == "MANUFACTURING_DATE").status == "PASS"

    # "PKD: 08/2026"
    decls_pkd = [{"category": "MANUFACTURING_DATE", "current_value": "PKD: 08/2026", "confidence": "High confidence"}]
    res_pkd = compliance_rule_engine.evaluate_declarations(decls_pkd)
    assert next(f for f in res_pkd.findings if f.category == "MANUFACTURING_DATE").status == "PASS"

    # Invalid Date
    decls_inv = [{"category": "MANUFACTURING_DATE", "current_value": "Freshly Prepared Daily", "confidence": "High confidence"}]
    res_inv = compliance_rule_engine.evaluate_declarations(decls_inv)
    assert next(f for f in res_inv.findings if f.category == "MANUFACTURING_DATE").status in ["FAIL", "REVIEW_REQUIRED"]

def test_consumer_care_rule_evaluation():
    # Email
    decls_email = [{"category": "CONSUMER_CARE", "current_value": "care@yogya.gov.in", "confidence": "High confidence"}]
    res_email = compliance_rule_engine.evaluate_declarations(decls_email)
    assert next(f for f in res_email.findings if f.category == "CONSUMER_CARE").status == "PASS"

    # Toll free phone number
    decls_phone = [{"category": "CONSUMER_CARE", "current_value": "Toll Free: 1800-111-2222", "confidence": "High confidence"}]
    res_phone = compliance_rule_engine.evaluate_declarations(decls_phone)
    assert next(f for f in res_phone.findings if f.category == "CONSUMER_CARE").status == "PASS"

    # Missing consumer care
    res_fail = compliance_rule_engine.evaluate_declarations([])
    assert next(f for f in res_fail.findings if f.category == "CONSUMER_CARE").status == "FAIL"

def test_country_of_origin_rule_evaluation():
    # "Made in India"
    decls_origin = [{"category": "COUNTRY_OF_ORIGIN", "current_value": "Made in India", "confidence": "High confidence"}]
    res_origin = compliance_rule_engine.evaluate_declarations(decls_origin)
    assert next(f for f in res_origin.findings if f.category == "COUNTRY_OF_ORIGIN").status == "PASS"

    # Missing origin
    res_fail = compliance_rule_engine.evaluate_declarations([])
    assert next(f for f in res_fail.findings if f.category == "COUNTRY_OF_ORIGIN").status == "FAIL"

def test_confidence_level_behavior():
    # High confidence + valid value -> PASS
    high_conf = [{"category": "MRP", "current_value": "₹500.00", "confidence": "High confidence"}]
    res_high = compliance_rule_engine.evaluate_declarations(high_conf)
    assert next(f for f in res_high.findings if f.category == "MRP").status == "PASS"

    # Medium confidence + valid value -> PASS
    med_conf = [{"category": "MRP", "current_value": "₹500.00", "confidence": "Medium confidence"}]
    res_med = compliance_rule_engine.evaluate_declarations(med_conf)
    assert next(f for f in res_med.findings if f.category == "MRP").status == "PASS"

    # Low confidence -> REVIEW_REQUIRED
    low_conf = [{"category": "MRP", "current_value": "₹500.00", "confidence": "Low confidence"}]
    res_low = compliance_rule_engine.evaluate_declarations(low_conf)
    assert next(f for f in res_low.findings if f.category == "MRP").status == "REVIEW_REQUIRED"

def test_finding_result_structure():
    decls = [{"category": "MRP", "current_value": "₹150.00", "confidence": "High confidence"}]
    res = compliance_rule_engine.evaluate_declarations(decls)
    finding = res.findings[0]
    
    assert hasattr(finding, "category")
    assert hasattr(finding, "status")
    assert hasattr(finding, "severity")
    assert hasattr(finding, "reason")
    assert hasattr(finding, "extracted_value")
    assert hasattr(finding, "confidence")
    assert hasattr(finding, "rule_reference")
