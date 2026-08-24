/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InspectionImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
}

export interface DeclarationField {
  id: string;
  category: string;
  categoryNumber: string;
  label: string;
  description: string;
  statutoryRuleRef: string;
  extractedValue: string;
  currentValue: string;
  isEdited: boolean;
  status: 'DETECTED' | 'NOT_DETECTED' | 'REVIEW_REQUIRED';
  confidence: 'High confidence' | 'Medium confidence' | 'Low confidence' | 'Review required';
  evidenceImageIndex: number;
}

export interface ComplianceFinding {
  id: string;
  categoryNumber: string;
  requirement: string;
  status: 'PASSED' | 'NEEDS_REVIEW' | 'VIOLATION' | 'PASS' | 'FAIL' | 'REVIEW_REQUIRED';
  severity: 'Critical' | 'Major' | 'Minor' | 'Advisory';
  reason: string;
  expectedCondition: string;
  detectedCondition: string;
  ruleReference: string;
  inspectorNote?: string;
}

export interface InspectionReport {
  id: string;
  referenceNumber: string;
  inspectionDate: string;
  createdAt: number;
  status: 'Draft' | 'Under Review' | 'Completed';
  
  // Product Information
  productName: string;
  manufacturer: string;
  address: string;
  netQuantity: string;
  mrp: string;
  dateInfo: string;
  consumerCare: string;
  countryOfOrigin: string;
  otherDeclarations: string;

  // Declarations
  declarations: DeclarationField[];

  // Compliance results
  overallStatus: 'COMPLIANT' | 'NEEDS REVIEW' | 'NON-COMPLIANT' | 'INCONCLUSIVE';
  stats: {
    totalChecked: number;
    passed: number;
    needsReview: number;
    failed: number;
  };
  findings: ComplianceFinding[];

  // Supporting Evidence
  evidenceImages: {
    id: string;
    previewUrl: string;
    name: string;
    relatedRequirement?: string;
    description: string;
  }[];

  // Inspector Observations
  observations: string;

  // Review confirmation
  reviewConfirmation: {
    declarationsReviewed: boolean;
    evidenceReviewed: boolean;
    complianceReviewed: boolean;
    inspectorConfirmed: boolean;
  };
}

export interface ProductSummary {
  id: string;
  name: string;
  manufacturer: string;
  address: string;
  netQuantity: string;
  mrp: string;
  countryOfOrigin: string;
  consumerCare: string;
  firstInspectedDate: string;
  latestInspectionDate: string;
  latestStatus: 'COMPLIANT' | 'NEEDS REVIEW' | 'NON-COMPLIANT' | 'INCONCLUSIVE';
  inspections: InspectionReport[];
  sampleImage?: { id: string; previewUrl: string; name: string };
  stats: {
    totalInspections: number;
    passed: number;
    needsReview: number;
    failed: number;
  };
}
