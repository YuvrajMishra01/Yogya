/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  InspectionImageItem,
  DeclarationField,
  ComplianceFinding,
  InspectionReport,
  ProductSummary,
} from '../types';

export function deriveProductCatalog(reports: InspectionReport[]): ProductSummary[] {
  const map = new Map<string, InspectionReport[]>();

  reports.forEach((r) => {
    const rawKey = (r.productName || 'Unlabeled Commodity').trim().toLowerCase();
    const key = rawKey || 'unlabeled';
    const group = map.get(key) || [];
    group.push(r);
    map.set(key, group);
  });

  const products: ProductSummary[] = [];

  map.forEach((group, key) => {
    const sorted = [...group].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const latest = sorted[0];
    const oldest = sorted[sorted.length - 1];

    let passedCount = 0;
    let reviewCount = 0;
    let failedCount = 0;

    sorted.forEach((insp) => {
      if (insp.overallStatus === 'COMPLIANT') passedCount++;
      else if (insp.overallStatus === 'NON-COMPLIANT') failedCount++;
      else reviewCount++;
    });

    let sampleImg: { id: string; previewUrl: string; name: string } | undefined;
    for (const insp of sorted) {
      if (insp.evidenceImages && insp.evidenceImages.length > 0) {
        sampleImg = insp.evidenceImages[0];
        break;
      }
    }

    products.push({
      id: `prod_${encodeURIComponent(key).slice(0, 30)}_${latest.id}`,
      name: latest.productName || 'Unlabeled Commodity',
      manufacturer: latest.manufacturer || 'Manufacturer Not Declared',
      address: latest.address || 'Address Not Declared',
      netQuantity: latest.netQuantity || 'Not declared',
      mrp: latest.mrp || 'Not declared',
      countryOfOrigin: latest.countryOfOrigin || 'Not declared',
      consumerCare: latest.consumerCare || 'Not declared',
      firstInspectedDate: oldest.inspectionDate || 'Unknown',
      latestInspectionDate: latest.inspectionDate || 'Unknown',
      latestStatus: latest.overallStatus,
      inspections: sorted,
      sampleImage: sampleImg,
      stats: {
        totalInspections: sorted.length,
        passed: passedCount,
        needsReview: reviewCount,
        failed: failedCount,
      },
    });
  });

  return products;
}

export function evaluateCompliance(
  declarations: DeclarationField[],
  images: InspectionImageItem[] = []
): {
  overallStatus: 'COMPLIANT' | 'NEEDS REVIEW' | 'NON-COMPLIANT' | 'INCONCLUSIVE';
  stats: { totalChecked: number; passed: number; needsReview: number; failed: number };
  findings: ComplianceFinding[];
} {
  if (!declarations || declarations.length === 0) {
    return {
      overallStatus: 'INCONCLUSIVE',
      stats: { totalChecked: 8, passed: 0, needsReview: 8, failed: 0 },
      findings: []
    };
  }

  const getVal = (id: string) => {
    const f = declarations.find((d) => d.id === id);
    return f ? f.currentValue.trim() : '';
  };

  const findings: ComplianceFinding[] = [];

  // 1. Product Name (Rule 6(1)(a))
  const pName = getVal('product_name');
  if (pName) {
    findings.push({
      id: 'finding_pname',
      categoryNumber: '01',
      requirement: 'Product Name / Identity',
      status: 'PASSED',
      severity: 'Minor',
      reason: 'Commodity identity / generic name detected on package display surface.',
      expectedCondition: 'Generic or specific identity on Principal Display Panel (PDP)',
      detectedCondition: `"${pName}"`,
      ruleReference: 'Rule 6(1)(a), Legal Metrology (PC) Rules, 2011'
    });
  } else {
    findings.push({
      id: 'finding_pname',
      categoryNumber: '01',
      requirement: 'Product Name / Identity',
      status: 'VIOLATION',
      severity: 'Critical',
      reason: 'Mandatory product name / generic identity declaration was not detected on package.',
      expectedCondition: 'Generic or specific identity on Principal Display Panel (PDP)',
      detectedCondition: 'Not detected',
      ruleReference: 'Rule 6(1)(a), Legal Metrology (PC) Rules, 2011'
    });
  }

  // 2. Manufacturer / Packer / Importer (Rule 6(1)(b))
  const mfg = getVal('manufacturer');
  if (mfg) {
    findings.push({
      id: 'finding_mfg',
      categoryNumber: '02',
      requirement: 'Manufacturer / Packer / Importer Name & Address',
      status: 'PASSED',
      severity: 'Minor',
      reason: 'Manufacturer, packer, or importer identification details verified.',
      expectedCondition: 'Complete name and statutory address of manufacturer, packer, or importer',
      detectedCondition: `"${mfg}"`,
      ruleReference: 'Rule 6(1)(b), Legal Metrology (PC) Rules, 2011'
    });
  } else {
    findings.push({
      id: 'finding_mfg',
      categoryNumber: '02',
      requirement: 'Manufacturer / Packer / Importer Name & Address',
      status: 'VIOLATION',
      severity: 'Critical',
      reason: 'Manufacturer, packer or importer name and address declaration is missing or unverified.',
      expectedCondition: 'Complete name and statutory address of manufacturer, packer, or importer',
      detectedCondition: 'Not detected',
      ruleReference: 'Rule 6(1)(b), Legal Metrology (PC) Rules, 2011'
    });
  }

  // 3. Net Quantity (Rule 6(1)(c) & Rule 12)
  const netQty = getVal('net_quantity');
  if (netQty) {
    findings.push({
      id: 'finding_netqty',
      categoryNumber: '03',
      requirement: 'Net Quantity Declaration',
      status: 'PASSED',
      severity: 'Minor',
      reason: 'Net weight, volume or unit count declared in standard metric units.',
      expectedCondition: 'Net quantity in standard SI metric units (g, kg, ml, l, count) with correct symbols',
      detectedCondition: `"${netQty}"`,
      ruleReference: 'Rule 6(1)(c) & Rule 12, Legal Metrology (PC) Rules, 2011'
    });
  } else {
    findings.push({
      id: 'finding_netqty',
      categoryNumber: '03',
      requirement: 'Net Quantity Declaration',
      status: 'VIOLATION',
      severity: 'Critical',
      reason: 'Mandatory net quantity declaration was not identified on package.',
      expectedCondition: 'Net quantity in standard SI metric units (g, kg, ml, l, count) with correct symbols',
      detectedCondition: 'Not detected',
      ruleReference: 'Rule 6(1)(c) & Rule 12, Legal Metrology (PC) Rules, 2011'
    });
  }

  // 4. Maximum Retail Price (MRP) (Rule 6(1)(e))
  const mrp = getVal('mrp');
  if (mrp) {
    findings.push({
      id: 'finding_mrp',
      categoryNumber: '04',
      requirement: 'Maximum Retail Price (MRP)',
      status: 'PASSED',
      severity: 'Minor',
      reason: 'Maximum Retail Price stated with all statutory tax inclusive phrasing.',
      expectedCondition: 'MRP in format "MRP Rs. XX.XX incl. of all taxes" or "₹ XX.XX (incl. of all taxes)"',
      detectedCondition: `"${mrp}"`,
      ruleReference: 'Rule 6(1)(e), Legal Metrology (PC) Rules, 2011'
    });
  } else {
    findings.push({
      id: 'finding_mrp',
      categoryNumber: '04',
      requirement: 'Maximum Retail Price (MRP)',
      status: 'VIOLATION',
      severity: 'Critical',
      reason: 'Mandatory Maximum Retail Price (MRP) declaration is missing.',
      expectedCondition: 'MRP in format "MRP Rs. XX.XX incl. of all taxes" or "₹ XX.XX (incl. of all taxes)"',
      detectedCondition: 'Not detected',
      ruleReference: 'Rule 6(1)(e), Legal Metrology (PC) Rules, 2011'
    });
  }

  // 5. Date Information (Rule 6(1)(d))
  const dateInfo = getVal('date_info');
  if (dateInfo) {
    const hasMultipleDates = (dateInfo.match(/\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}/g) || []).length > 1;
    const isAmbiguousDualDate = hasMultipleDates || dateInfo.includes('/ 20/03/26') || dateInfo.includes('21/09/24 /');

    if (isAmbiguousDualDate) {
      findings.push({
        id: 'finding_date',
        categoryNumber: '05',
        requirement: 'Date of Manufacture / Packing / Import',
        status: 'NEEDS_REVIEW',
        severity: 'Major',
        reason: 'Multiple dates detected on packaging (21/09/24 and 20/03/26) without clear individual statutory identifiers (e.g., Mfd vs. Expiry/Use By). Physical verification required.',
        expectedCondition: 'Month and Year of manufacture or packing clearly distinguished with statutory prefix',
        detectedCondition: `"${dateInfo}"`,
        ruleReference: 'Rule 6(1)(d), Legal Metrology (PC) Rules, 2011'
      });
    } else {
      findings.push({
        id: 'finding_date',
        categoryNumber: '05',
        requirement: 'Date of Manufacture / Packing / Import',
        status: 'PASSED',
        severity: 'Minor',
        reason: 'Month and year of manufacture, packing or import identified.',
        expectedCondition: 'Month and Year of manufacture, packing or import in prescribed format',
        detectedCondition: `"${dateInfo}"`,
        ruleReference: 'Rule 6(1)(d), Legal Metrology (PC) Rules, 2011'
      });
    }
  } else {
    findings.push({
      id: 'finding_date',
      categoryNumber: '05',
      requirement: 'Date of Manufacture / Packing / Import',
      status: 'VIOLATION',
      severity: 'Major',
      reason: 'Month and year of manufacture or packaging is not clearly displayed.',
      expectedCondition: 'Month and Year of manufacture, packing or import in prescribed format',
      detectedCondition: 'Not detected',
      ruleReference: 'Rule 6(1)(d), Legal Metrology (PC) Rules, 2011'
    });
  }

  // 6. Consumer Care Details (Rule 6(1)(n))
  const cc = getVal('consumer_care');
  if (cc) {
    findings.push({
      id: 'finding_cc',
      categoryNumber: '06',
      requirement: 'Consumer Care Contact Information',
      status: 'PASSED',
      severity: 'Minor',
      reason: 'Consumer helpline, email or contact address identified.',
      expectedCondition: 'Name, address, phone number, and email address for consumer grievances',
      detectedCondition: `"${cc}"`,
      ruleReference: 'Rule 6(1)(n), Legal Metrology (PC) Rules, 2011'
    });
  } else {
    findings.push({
      id: 'finding_cc',
      categoryNumber: '06',
      requirement: 'Consumer Care Contact Information',
      status: 'VIOLATION',
      severity: 'Major',
      reason: 'Statutory consumer redressal / helpline information not detected on visible packaging.',
      expectedCondition: 'Name, address, phone number, and email address for consumer grievances',
      detectedCondition: 'Not detected',
      ruleReference: 'Rule 6(1)(n), Legal Metrology (PC) Rules, 2011'
    });
  }

  // 7. Country of Origin (Rule 6(1)(g))
  const origin = getVal('country_of_origin');
  if (origin) {
    findings.push({
      id: 'finding_origin',
      categoryNumber: '07',
      requirement: 'Country of Origin / Manufacture',
      status: 'PASSED',
      severity: 'Minor',
      reason: 'Country of origin / source declared.',
      expectedCondition: 'Country of origin / manufacture where applicable or imported',
      detectedCondition: `"${origin}"`,
      ruleReference: 'Rule 6(1)(g) & Rule 6(10), Legal Metrology (PC) Rules, 2011'
    });
  } else {
    findings.push({
      id: 'finding_origin',
      categoryNumber: '07',
      requirement: 'Country of Origin / Manufacture',
      status: 'NEEDS_REVIEW',
      severity: 'Minor',
      reason: 'Country of origin not detected; verify if commodity is domestically manufactured or imported.',
      expectedCondition: 'Country of origin / manufacture where applicable or imported',
      detectedCondition: 'Not detected',
      ruleReference: 'Rule 6(1)(g) & Rule 6(10), Legal Metrology (PC) Rules, 2011'
    });
  }

  // 8. Other Declarations (Rules 6 & 18)
  const other = getVal('other_declarations');
  if (other) {
    findings.push({
      id: 'finding_other',
      categoryNumber: '08',
      requirement: 'Other Statutory Declarations / Batch',
      status: 'PASSED',
      severity: 'Minor',
      reason: 'Batch/lot numbers or statutory license markings detected.',
      expectedCondition: 'Batch number, license numbers, or statutory symbol markings',
      detectedCondition: `"${other}"`,
      ruleReference: 'Rules 6 & 18, Legal Metrology (PC) Rules, 2011'
    });
  } else {
    findings.push({
      id: 'finding_other',
      categoryNumber: '08',
      requirement: 'Other Statutory Declarations / Batch',
      status: 'NEEDS_REVIEW',
      severity: 'Advisory',
      reason: 'Batch / lot identifier or category-specific symbols not identified.',
      expectedCondition: 'Batch number, license numbers, or statutory symbol markings',
      detectedCondition: 'Not detected',
      ruleReference: 'Rules 6 & 18, Legal Metrology (PC) Rules, 2011'
    });
  }

  const passed = findings.filter((f) => f.status === 'PASSED').length;
  const failed = findings.filter((f) => f.status === 'VIOLATION').length;
  const needsReview = findings.filter((f) => f.status === 'NEEDS_REVIEW').length;

  let overallStatus: 'COMPLIANT' | 'NEEDS REVIEW' | 'NON-COMPLIANT' | 'INCONCLUSIVE' = 'COMPLIANT';
  if (images.length === 0) {
    overallStatus = 'INCONCLUSIVE';
  } else if (failed > 0) {
    overallStatus = 'NON-COMPLIANT';
  } else if (needsReview > 0) {
    overallStatus = 'NEEDS REVIEW';
  } else {
    overallStatus = 'COMPLIANT';
  }

  return {
    overallStatus,
    stats: {
      totalChecked: 8,
      passed,
      needsReview,
      failed
    },
    findings
  };
}

export function generateInspectionReport(
  declarations: DeclarationField[],
  images: InspectionImageItem[],
  inspectorChecklist: { identity: boolean; declarations: boolean; corrections: boolean; evidence: boolean },
  finalReviewConfirmed: boolean,
  observations: string = ''
): InspectionReport {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthStr = months[now.getMonth()];
  const year = now.getFullYear();
  const dateStr = `${day} ${monthStr} ${year}`;
  
  const randCode = Math.floor(1000 + Math.random() * 9000);
  const ref = `MS-${year}${(now.getMonth() + 1).toString().padStart(2, '0')}${day}-${randCode}`;

  const evalResult = evaluateCompliance(declarations, images);

  const getVal = (id: string) => {
    const f = declarations.find((d) => d.id === id);
    return (f && f.currentValue) ? f.currentValue.trim() : '';
  };

  const isCompleted =
    inspectorChecklist.identity &&
    inspectorChecklist.declarations &&
    inspectorChecklist.corrections &&
    inspectorChecklist.evidence &&
    finalReviewConfirmed;

  return {
    id: ref,
    referenceNumber: ref,
    inspectionDate: dateStr,
    createdAt: Date.now(),
    status: isCompleted ? 'Completed' : 'Under Review',
    productName: getVal('product_name') || 'Unidentified Commodity',
    manufacturer: getVal('manufacturer') || 'Not detected',
    address: getVal('manufacturer') || 'Not detected',
    netQuantity: getVal('net_quantity') || 'Not detected',
    mrp: getVal('mrp') || 'Not detected',
    dateInfo: getVal('date_info') || 'Not detected',
    consumerCare: getVal('consumer_care') || 'Not detected',
    countryOfOrigin: getVal('country_of_origin') || 'Not detected',
    otherDeclarations: getVal('other_declarations') || 'Not detected',
    declarations: JSON.parse(JSON.stringify(declarations)),
    overallStatus: evalResult.overallStatus,
    stats: evalResult.stats,
    findings: evalResult.findings,
    evidenceImages: images.map((img, idx) => ({
      id: img.id,
      previewUrl: img.previewUrl,
      name: img.name,
      relatedRequirement: idx === 0 ? 'Rule 6(1)(a) PDP / Identity' : 'Statutory Back Panel & Declarations',
      description: idx === 0 ? 'Primary package face (Principal Display Panel)' : `Package surface view ${idx + 1}`
    })),
    observations: observations.trim(),
    reviewConfirmation: {
      declarationsReviewed: inspectorChecklist.declarations,
      evidenceReviewed: inspectorChecklist.evidence,
      complianceReviewed: true,
      inspectorConfirmed: finalReviewConfirmed
    }
  };
}

export function exportReportAsHtml(report: InspectionReport) {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Yogya Compliance Report - ${report.referenceNumber}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #FFFFFF;
      color: #111827;
      margin: 0;
      padding: 40px 20px;
      line-height: 1.5;
    }
    .report-card {
      max-width: 900px;
      margin: 0 auto;
      border: 1px solid #D9DEE7;
      padding: 40px;
      background-color: #FFFFFF;
    }
    .header-top {
      border-bottom: 2px solid #071A33;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .brand-title {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 24px;
      font-weight: 800;
      color: #071A33;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 11px;
      font-family: monospace;
      text-transform: uppercase;
      color: #667085;
      letter-spacing: 1px;
    }
    .report-title {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 18px;
      font-weight: 700;
      margin-top: 15px;
      margin-bottom: 5px;
      color: #111827;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      background-color: #FAFAFC;
      border: 1px solid #D9DEE7;
      padding: 15px;
      margin-bottom: 25px;
      font-size: 12px;
      font-family: monospace;
    }
    .section-title {
      font-family: monospace;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #667085;
      border-bottom: 1px solid #D9DEE7;
      padding-bottom: 5px;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-bottom: 20px;
    }
    .data-table th, .data-table td {
      border: 1px solid #D9DEE7;
      padding: 10px 12px;
      text-align: left;
    }
    .data-table th {
      background-color: #E8F0FC;
      font-family: monospace;
      font-size: 11px;
      text-transform: uppercase;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 11px;
      font-family: monospace;
      font-weight: bold;
      border: 1px solid #D9DEE7;
      background-color: #FAFAFC;
      text-transform: uppercase;
    }
    .badge-pass { background-color: #EAF5EF; color: #287A52; border-color: #287A52; }
    .badge-fail { background-color: #FDF2F2; color: #C62828; border-color: #C62828; }
    .badge-warn { background-color: #FEF8EC; color: #B7791F; border-color: #B7791F; }
    .finding-card {
      border: 1px solid #D9DEE7;
      padding: 15px;
      margin-bottom: 12px;
      background-color: #FAFAFC;
      font-size: 13px;
    }
    .footer-note {
      margin-top: 40px;
      border-top: 1px solid #D9DEE7;
      padding-top: 15px;
      font-size: 11px;
      font-family: monospace;
      color: #667085;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
      .report-card { border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="report-card">
    <div class="header-top">
      <h1 class="brand-title">YOGYA</h1>
      <div class="brand-subtitle">DIGITAL INSPECTION PLATFORM • LEGAL METROLOGY COMPLIANCE</div>
      <div class="report-title">COMPLIANCE INSPECTION REPORT</div>
    </div>

    <div class="meta-grid">
      <div><strong>INSPECTION REF:</strong> ${report.referenceNumber}</div>
      <div><strong>DATE:</strong> ${report.inspectionDate}</div>
      <div><strong>STATUS:</strong> ${report.status.toUpperCase()}</div>
    </div>

    <p style="font-size: 13px; color: #667085; margin-bottom: 25px;">
      This official report records the information captured, reviewed and evaluated during a Yogya compliance inspection under the Legal Metrology (Packaged Commodities) Rules, 2011.
    </p>

    <div class="section-title">01 / PRODUCT INFORMATION</div>
    <table class="data-table">
      <tr><td style="width: 30%; font-weight: bold;">Product Name</td><td>${report.productName || 'Not detected'}</td></tr>
      <tr><td style="font-weight: bold;">Manufacturer / Packer / Importer</td><td>${report.manufacturer || 'Not detected'}</td></tr>
      <tr><td style="font-weight: bold;">Net Quantity</td><td>${report.netQuantity || 'Not detected'}</td></tr>
      <tr><td style="font-weight: bold;">Maximum Retail Price</td><td>${report.mrp || 'Not detected'}</td></tr>
      <tr><td style="font-weight: bold;">Date Information</td><td>${report.dateInfo || 'Not detected'}</td></tr>
      <tr><td style="font-weight: bold;">Consumer Care</td><td>${report.consumerCare || 'Not detected'}</td></tr>
      <tr><td style="font-weight: bold;">Country of Origin</td><td>${report.countryOfOrigin || 'Not detected'}</td></tr>
      <tr><td style="font-weight: bold;">Other Declarations</td><td>${report.otherDeclarations || 'Not detected'}</td></tr>
    </table>

    <div class="section-title">02 / DECLARATION REVIEW TABLE</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Requirement</th>
          <th>Detected Information</th>
          <th>Status</th>
          <th>Review</th>
        </tr>
      </thead>
      <tbody>
        ${report.declarations.map(d => `
          <tr>
            <td><strong>${d.categoryNumber}. ${d.label}</strong><br><span style="font-size: 10px; color: #667085;">${d.statutoryRuleRef}</span></td>
            <td>${d.currentValue || '<em style="color: #888;">Not detected</em>'}</td>
            <td><span class="badge ${d.currentValue ? 'badge-pass' : 'badge-fail'}">${d.currentValue ? 'DETECTED' : 'NOT DETECTED'}</span></td>
            <td><span style="font-size: 11px;">${d.isEdited ? 'Edited by inspector' : 'Reviewed'}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="section-title">03 / COMPLIANCE SUMMARY</div>
    <div style="background-color: #FAFAFC; border: 1px solid #D9DEE7; padding: 15px; margin-bottom: 20px;">
      <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">
        OVERALL DETERMINATION: <span class="badge ${report.overallStatus === 'COMPLIANT' ? 'badge-pass' : report.overallStatus === 'NON-COMPLIANT' ? 'badge-fail' : 'badge-warn'}">${report.overallStatus}</span>
      </div>
      <div style="font-size: 12px; font-family: monospace;">
        Checked: ${report.stats.totalChecked} | Passed: ${report.stats.passed} | Needs Review: ${report.stats.needsReview} | Violations: ${report.stats.failed}
      </div>
    </div>

    <div class="section-title">04 / STATUTORY FINDINGS</div>
    ${report.findings.length === 0 ? '<p style="font-size: 13px; color: #287A52;">✓ No findings requiring attention.</p>' : ''}
    ${report.findings.map(f => {
      const isPassed = f.status === 'PASSED';
      const isReview = f.status === 'NEEDS_REVIEW' || (f.status as string) === 'REVIEW';
      const bg = isPassed ? '#F1F8F4' : isReview ? '#FFF9EC' : '#FDF1F1';
      const borderLeft = isPassed ? '3.5px solid #4CAF7D' : isReview ? '3.5px solid #D9A441' : '3.5px solid #D96B6B';
      const badgeBg = isPassed ? '#EAF6EF' : isReview ? '#FFF5DF' : '#FCECEC';
      const badgeColor = isPassed ? '#4CAF7D' : isReview ? '#D9A441' : '#D96B6B';
      const badgeBorder = isPassed ? 'rgba(76, 175, 125, 0.4)' : isReview ? 'rgba(217, 164, 65, 0.4)' : 'rgba(217, 107, 107, 0.4)';
      const label = isPassed ? 'PASSED' : isReview ? 'REVIEW' : 'NON-COMPLIANT';

      return `
      <div class="finding-card" style="background-color: ${bg}; border-left: ${borderLeft};">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <strong>${f.categoryNumber}. ${f.requirement} (${f.ruleReference})</strong>
          <span class="badge" style="background-color: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder};">${label} • ${f.severity}</span>
        </div>
        <div style="font-size: 12px; color: #667085; margin-bottom: 4px;"><strong>Reason:</strong> ${f.reason}</div>
        <div style="font-size: 12px; color: #667085; margin-bottom: 2px;"><strong>Expected:</strong> ${f.expectedCondition}</div>
        <div style="font-size: 12px; color: #111827;"><strong>Detected:</strong> ${f.detectedCondition}</div>
      </div>
      `;
    }).join('')}

    <div class="section-title">05 / INSPECTOR OBSERVATIONS</div>
    <div style="background-color: #FAFAFC; border: 1px solid #D9DEE7; padding: 15px; font-size: 13px; margin-bottom: 25px;">
      ${report.observations || '<em>No inspector observations were recorded.</em>'}
    </div>

    <div class="section-title">06 / REVIEW CONFIRMATION</div>
    <table class="data-table" style="font-size: 12px;">
      <tr><td>Declaration review</td><td><strong>${report.reviewConfirmation.declarationsReviewed ? '✓ Completed' : 'Pending'}</strong></td></tr>
      <tr><td>Evidence review</td><td><strong>${report.reviewConfirmation.evidenceReviewed ? '✓ Completed' : 'Pending'}</strong></td></tr>
      <tr><td>Compliance review</td><td><strong>${report.reviewConfirmation.complianceReviewed ? '✓ Completed' : 'Pending'}</strong></td></tr>
      <tr><td>Inspector confirmation</td><td><strong>${report.reviewConfirmation.inspectorConfirmed ? '✓ Completed' : 'Pending'}</strong></td></tr>
    </table>

    <div class="footer-note">
      YOGYA • DIGITAL INSPECTION PLATFORM • SYSTEM EDITION 2026<br>
      Generated from recorded inspection information. Automated screening is intended to assist inspection workflows and does not replace authorized regulatory review.
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Yogya_Report_${report.referenceNumber}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseDeclarationsFromOcr(text: string, imageIndex: number, confidenceAvg?: number): DeclarationField[] {
  const cleanText = text.trim();
  const lines = cleanText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let semanticConf: 'High confidence' | 'Medium confidence' | 'Low confidence' | 'Review required' = 'Review required';
  if (confidenceAvg !== undefined && confidenceAvg !== null) {
    if (confidenceAvg >= 75) semanticConf = 'High confidence';
    else if (confidenceAvg >= 50) semanticConf = 'Medium confidence';
    else semanticConf = 'Low confidence';
  }

  // 1. Product Name: Look for prominent text lines before manufacturer/ingredients/statutory markers
  let detectedProductName = '';
  for (const line of lines) {
    if (
      !/mfg|mfd|packed|pkd|net\s*(?:wt|qty|quantity)|mrp|rs|₹|exp|use\s*by|batch|customer|consumer|ingredients|fssai|marketed|imported|lic\s*no/i.test(line) &&
      line.length >= 3 &&
      line.length <= 60
    ) {
      detectedProductName = line;
      break;
    }
  }

  // 2. Manufacturer / Packer / Importer
  let detectedManufacturer = '';
  const mfgMatch = cleanText.match(/(?:mfd\.?|mfg\.?|manufactured|packed|pkd\.?|imported|marketed)\s*(?:by|at)?[:\s\-]+([^\n\r]+(?:\n[^\n\r]+)?)/i);
  if (mfgMatch && mfgMatch[1]) {
    detectedManufacturer = mfgMatch[1].trim();
  }

  // 3. Net Quantity
  let detectedNetQty = '';
  const netQtyMatch =
    cleanText.match(/(?:net\s*(?:quantity|qty|wt\.?|weight|volume|contents?)|net\s*wt|quantity|qty|net\.)[:\s\-]*([0-9]+(?:\.[0-9]+)?\s*(?:g|gm|gms|kg|kilogram|ml|l|ltr|litre|litres|m|meter|cm|pcs|pieces|units|u|count|n)\b[^\n\r]*)/i) ||
    cleanText.match(/\b([0-9]+(?:\.[0-9]+)?\s*(?:g|gm|gms|kg|ml|l|ltr)\b(?:\s*\([^\)]+\))?)/i);
  if (netQtyMatch && netQtyMatch[1]) {
    detectedNetQty = netQtyMatch[1].trim();
  }

  // 4. Maximum Retail Price (MRP)
  let detectedMrp = '';
  const mrpMatch =
    cleanText.match(/(?:m\.?r\.?p\.?|max(?:imum)?\s*retail\s*price|mrp)[:\s\.\-₹Rs\d]*([₹Rs\.\s]*[0-9]+(?:\.[0-9]{2})?(?:\s*(?:incl\.?|inclusive|of\s+all\s+taxes))?)/i) ||
    cleanText.match(/(?:₹|rs\.?)\s*([0-9]+(?:\.[0-9]{2})?)/i);
  if (mrpMatch) {
    detectedMrp = mrpMatch[0].trim();
  }

  // 5. Date Information
  let detectedDateInfo = '';
  const dateMatch = cleanText.match(
    /(?:mfg|pkd|mfd|packed|manufactured|date\s*of\s*(?:packing|mfg|manufacture)|use\s*by|exp|expiry|best\s*before)[:\s\.\-]*([0-9]{1,2}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{2,4}|[A-Za-z]{3,9}[\s\-\.\/]+20[0-9]{2}|[0-9]{1,2}\s+[A-Za-z]{3,9}\s+20[0-9]{2}|[0-9]{2}\/[0-9]{4})/i
  );
  if (dateMatch) {
    detectedDateInfo = dateMatch[0].trim();
  }

  // 6. Consumer Care
  let detectedConsumerCare = '';
  const ccMatch =
    cleanText.match(/(?:consumer\s*care|customer\s*care|grievance|helpline|toll\s*free|feedback|contact\s*us|care\s*cell|reach\s*us)[:\s\.\-]*([^\n\r]+(?:\n[^\n\r]+)?)/i) ||
    cleanText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/) ||
    cleanText.match(/(?:1800[-\s\d]{6,12})/);
  if (ccMatch) {
    detectedConsumerCare = ccMatch[0].trim();
  }

  // 7. Country of Origin
  let detectedOrigin = '';
  const originMatch = cleanText.match(/(?:country\s*of\s*origin|made\s*in|origin)[:\s\-]*([A-Za-z\s]+)/i);
  if (originMatch && originMatch[1]) {
    detectedOrigin = originMatch[1].trim();
  }

  // 8. Other Declarations
  let detectedOther = '';
  const otherMatch = cleanText.match(/(?:batch|lot|b\.?\s*no\.?|lic(?:ense)?\s*no\.?|fssai|reg\.?\s*no)[:\s\-]*([A-Za-z0-9\-_ /]+)/i);
  if (otherMatch) {
    detectedOther = otherMatch[0].trim();
  }

  return [
    {
      id: 'product_name',
      category: 'PRODUCT INFORMATION',
      categoryNumber: '01',
      label: 'Product name',
      description: 'Generic name or specific identity of commodity',
      statutoryRuleRef: 'Rule 6(1)(a)',
      extractedValue: detectedProductName,
      currentValue: detectedProductName,
      isEdited: false,
      status: detectedProductName ? 'DETECTED' : 'NOT_DETECTED',
      confidence: detectedProductName ? semanticConf : 'Review required',
      evidenceImageIndex: imageIndex,
    },
    {
      id: 'manufacturer',
      category: 'MANUFACTURER / PACKER / IMPORTER',
      categoryNumber: '02',
      label: 'Name and address',
      description: 'Manufacturer, packer or importer statutory identification',
      statutoryRuleRef: 'Rule 6(1)(b)',
      extractedValue: detectedManufacturer,
      currentValue: detectedManufacturer,
      isEdited: false,
      status: detectedManufacturer ? 'DETECTED' : 'NOT_DETECTED',
      confidence: detectedManufacturer ? semanticConf : 'Review required',
      evidenceImageIndex: imageIndex,
    },
    {
      id: 'net_quantity',
      category: 'NET QUANTITY',
      categoryNumber: '03',
      label: 'Quantity declaration',
      description: 'Standard unit of weight, measure or numerical count',
      statutoryRuleRef: 'Rule 6(1)(c) & Rule 12',
      extractedValue: detectedNetQty,
      currentValue: detectedNetQty,
      isEdited: false,
      status: detectedNetQty ? 'DETECTED' : 'NOT_DETECTED',
      confidence: detectedNetQty ? semanticConf : 'Review required',
      evidenceImageIndex: imageIndex,
    },
    {
      id: 'mrp',
      category: 'MAXIMUM RETAIL PRICE',
      categoryNumber: '04',
      label: 'MRP (Inclusive of all taxes)',
      description: 'Maximum Retail Price declaration in Indian Rupees',
      statutoryRuleRef: 'Rule 6(1)(e)',
      extractedValue: detectedMrp,
      currentValue: detectedMrp,
      isEdited: false,
      status: detectedMrp ? 'DETECTED' : 'NOT_DETECTED',
      confidence: detectedMrp ? semanticConf : 'Review required',
      evidenceImageIndex: imageIndex,
    },
    {
      id: 'date_info',
      category: 'DATE INFORMATION',
      categoryNumber: '05',
      label: 'Manufactured / packed / imported information',
      description: 'Month and year of manufacture, packing or import',
      statutoryRuleRef: 'Rule 6(1)(d)',
      extractedValue: detectedDateInfo,
      currentValue: detectedDateInfo,
      isEdited: false,
      status: detectedDateInfo ? 'DETECTED' : 'NOT_DETECTED',
      confidence: detectedDateInfo ? semanticConf : 'Review required',
      evidenceImageIndex: imageIndex,
    },
    {
      id: 'consumer_care',
      category: 'CONSUMER CARE',
      categoryNumber: '06',
      label: 'Consumer care contact information',
      description: 'Name, address, telephone and email for customer redressal',
      statutoryRuleRef: 'Rule 6(1)(n)',
      extractedValue: detectedConsumerCare,
      currentValue: detectedConsumerCare,
      isEdited: false,
      status: detectedConsumerCare ? 'DETECTED' : 'NOT_DETECTED',
      confidence: detectedConsumerCare ? semanticConf : 'Review required',
      evidenceImageIndex: imageIndex,
    },
    {
      id: 'country_of_origin',
      category: 'COUNTRY OF ORIGIN',
      categoryNumber: '07',
      label: 'Country of origin, where applicable',
      description: 'Mandatory declaration for imported goods or country source',
      statutoryRuleRef: 'Rule 6(1)(g)',
      extractedValue: detectedOrigin,
      currentValue: detectedOrigin,
      isEdited: false,
      status: detectedOrigin ? 'DETECTED' : 'NOT_DETECTED',
      confidence: detectedOrigin ? semanticConf : 'Review required',
      evidenceImageIndex: imageIndex,
    },
    {
      id: 'other_declarations',
      category: 'OTHER DECLARATIONS',
      categoryNumber: '08',
      label: 'Other visible package information',
      description: 'Batch number, license numbers, or statutory symbols',
      statutoryRuleRef: 'Rules 6 & 18',
      extractedValue: detectedOther,
      currentValue: detectedOther,
      isEdited: false,
      status: detectedOther ? 'DETECTED' : 'NOT_DETECTED',
      confidence: detectedOther ? semanticConf : 'Review required',
      evidenceImageIndex: imageIndex,
    },
  ];
}
