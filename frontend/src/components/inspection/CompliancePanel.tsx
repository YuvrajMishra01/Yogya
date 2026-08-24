/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  FileText,
  FileCheck,
  ArrowLeft,
  X
} from 'lucide-react';
import { DeclarationField, InspectionImageItem, InspectionReport } from '../../types';
import { evaluateCompliance, generateInspectionReport } from '../../lib/compliance';
import { FindingsPanel } from './FindingsPanel';

interface CompliancePanelProps {
  declarations: DeclarationField[];
  images: InspectionImageItem[];
  inspectorChecklist: {
    identity: boolean;
    declarations: boolean;
    corrections: boolean;
    evidence: boolean;
  };
  finalReviewConfirmed: boolean;
  inspectorObservations: string;
  setInspectorObservations: React.Dispatch<React.SetStateAction<string>>;
  complianceSignoff: boolean;
  setComplianceSignoff: React.Dispatch<React.SetStateAction<boolean>>;
  generatedReportNotice: string | null;
  setGeneratedReportNotice: React.Dispatch<React.SetStateAction<string | null>>;
  onSaveReport?: (report: InspectionReport) => void;
  navigate: (path: string) => void;
  onBackToDeclarations: () => void;
}

import { api } from '../../lib/api';

export const CompliancePanel: React.FC<CompliancePanelProps> = ({
  declarations,
  images,
  inspectorChecklist,
  finalReviewConfirmed,
  inspectorObservations,
  setInspectorObservations,
  complianceSignoff,
  setComplianceSignoff,
  generatedReportNotice,
  setGeneratedReportNotice,
  onSaveReport,
  navigate,
  onBackToDeclarations,
}) => {
  const complianceResult = evaluateCompliance(declarations, images);
  const { findings, stats, overallStatus } = complianceResult;

  const handleGenerateReportClick = async () => {
    if (!complianceSignoff) {
      setGeneratedReportNotice(
        'Please acknowledge the statutory verification sign-off before generating the final report.'
      );
      return;
    }

    const newReport = generateInspectionReport(
      declarations,
      images,
      inspectorChecklist,
      finalReviewConfirmed,
      inspectorObservations
    );

    try {
      // Extract File objects from images
      const filesToUpload: File[] = images
        .map((img) => img.file)
        .filter((f): f is File => f instanceof File);

      // Create new inspection record with uploaded evidence images via backend POST /api/v1/inspections
      const createdReport = await api.createInspection(filesToUpload, {
        productName: newReport.productName,
        manufacturer: newReport.manufacturer,
      });

      // Update nested declarations, findings, observations & confirmations on created report
      const updatedReport = await api.updateInspection(createdReport.id, {
        ...newReport,
        id: createdReport.id,
      });

      if (onSaveReport) {
        onSaveReport(updatedReport);
      } else {
        navigate('/reports');
      }
    } catch (err: any) {
      console.error('Failed to submit inspection to backend, falling back to report view', err);
      if (onSaveReport) {
        onSaveReport(newReport);
      } else {
        navigate('/reports');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-6 sm:p-8 rounded-xs shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D9DEE7]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs text-[10px] font-mono font-semibold uppercase text-[#667085] mb-2">
              STAGE 04 / STATUTORY COMPLIANCE AUDIT
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#111827]">
              Compliance determination & findings
            </h2>
            <p className="text-xs sm:text-sm text-[#667085] mt-1">
              Evaluation against Legal Metrology (Packaged Commodities) Rules, 2011.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-mono font-bold tracking-wider uppercase border ${
                overallStatus === 'COMPLIANT'
                  ? 'bg-[#287A52]/10 text-[#287A52] border-[#287A52]/30'
                  : overallStatus === 'NON-COMPLIANT'
                  ? 'bg-[#C62828]/10 text-[#C62828] border-[#C62828]/30'
                  : 'bg-[#B7791F]/10 text-[#B7791F] border-[#B7791F]/30'
              }`}
            >
              {overallStatus === 'COMPLIANT' && <CheckCircle2 className="w-4 h-4" />}
              {overallStatus === 'NON-COMPLIANT' && <AlertTriangle className="w-4 h-4" />}
              {(overallStatus === 'NEEDS REVIEW' || overallStatus === 'INCONCLUSIVE') && (
                <Info className="w-4 h-4" />
              )}
              <span>
                {overallStatus === 'COMPLIANT'
                  ? 'Statutorily Compliant'
                  : overallStatus === 'NON-COMPLIANT'
                  ? 'Non-Compliant Findings'
                  : 'Review Required'}
              </span>
            </span>
          </div>
        </div>

        {/* 4-Stat Metric Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
          <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
            <div className="text-[10px] font-mono text-[#667085] uppercase">
              Mandatory Declarations
            </div>
            <div className="text-xl font-mono font-bold text-[#111827] mt-1">
              {stats.totalChecked}
            </div>
            <div className="text-[10px] text-[#667085] mt-0.5 font-mono">
              Total statutory checks
            </div>
          </div>

          <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
            <div className="text-[10px] font-mono text-[#287A52] uppercase">
              Passed Requirements
            </div>
            <div className="text-xl font-mono font-bold text-[#287A52] mt-1">
              {stats.passed}
            </div>
            <div className="text-[10px] text-[#667085] mt-0.5 font-mono">
              Fully satisfied
            </div>
          </div>

          <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
            <div className="text-[10px] font-mono text-[#B7791F] uppercase">
              Items Requiring Review
            </div>
            <div className="text-xl font-mono font-bold text-[#B7791F] mt-1">
              {stats.needsReview}
            </div>
            <div className="text-[10px] text-[#667085] mt-0.5 font-mono">
              Needs clarification
            </div>
          </div>

          <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
            <div className="text-[10px] font-mono text-[#C62828] uppercase">
              Confirmed Deficiencies
            </div>
            <div className="text-xl font-mono font-bold text-[#C62828] mt-1">
              {stats.failed}
            </div>
            <div className="text-[10px] text-[#667085] mt-0.5 font-mono">
              Missing or deficient
            </div>
          </div>
        </div>
      </div>

      {/* Findings Breakdown Matrix */}
      <FindingsPanel findings={findings} />

      {/* Inspector Observations & Remarks Section */}
      <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-5 sm:p-6 rounded-xs shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#D9DEE7]">
          <FileText className="w-4 h-4 text-[#111827]" />
          <h3 className="text-sm font-serif font-bold text-[#111827]">
            Inspector Observations & Field Remarks
          </h3>
        </div>

        <div>
          <label className="block text-xs font-mono text-[#667085] uppercase mb-1.5">
            Official Remarks / Follow-up Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={inspectorObservations}
            onChange={(e) => setInspectorObservations(e.target.value)}
            placeholder="Record any physical package observations, seal condition, laboratory sampling recommendations, or manufacturer explanations..."
            className="w-full p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs text-xs font-sans text-[#111827] focus:bg-[#FFFFFF] focus:border-[#071B3A] focus:outline-none transition-colors"
          />
        </div>

        {/* Statutory Sign-off Verification */}
        <div className="p-4 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-3">
          <div className="text-[10px] font-mono font-bold uppercase text-[#667085]">
            STATUTORY VERIFICATION & SIGN-OFF
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={complianceSignoff}
              onChange={(e) => {
                setComplianceSignoff(e.target.checked);
                if (e.target.checked) {
                  setGeneratedReportNotice(null);
                }
              }}
              className="mt-0.5 w-4 h-4 rounded-xs border-[#D9DEE7] text-[#111827] accent-[#071B3A] cursor-pointer"
            />
            <span className="text-xs text-[#111827] leading-relaxed">
              I confirm that I have reviewed the photographic evidence, declaration extractions, and statutory requirements in accordance with the Legal Metrology Act, 2009 and Packaged Commodities Rules, 2011.
            </span>
          </label>
        </div>

        {/* Error / Notice Alert */}
        <AnimatePresence>
          {generatedReportNotice && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-[#C62828]/10 border border-[#C62828]/30 text-[#C62828] text-xs rounded-xs flex items-center justify-between gap-2"
            >
              <span>{generatedReportNotice}</span>
              <button
                onClick={() => setGeneratedReportNotice(null)}
                className="p-1 hover:text-[#111827] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#D9DEE7]">
          <button
            type="button"
            onClick={onBackToDeclarations}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Declarations</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateReportClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
          >
            <FileCheck className="w-4 h-4" />
            <span>Generate Official Compliance Report</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
