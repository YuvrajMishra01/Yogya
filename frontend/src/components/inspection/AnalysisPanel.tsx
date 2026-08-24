/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  RotateCcw,
  AlertCircle,
  FileText,
  Copy,
  Edit3,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { DeclarationField } from '../../types';

interface AnalysisPanelProps {
  ocrStatus: 'idle' | 'preparing' | 'reading' | 'identifying' | 'completed' | 'error';
  ocrProgressText: string;
  ocrError: string | null;
  ocrConfidenceScore: number | null;
  rawOcrText: string;
  editedRawOcrText: string;
  setEditedRawOcrText: React.Dispatch<React.SetStateAction<string>>;
  isEditingRawText: boolean;
  setIsEditingRawText: React.Dispatch<React.SetStateAction<boolean>>;
  showRawTextPanel: boolean;
  setShowRawTextPanel: React.Dispatch<React.SetStateAction<boolean>>;
  declarations: DeclarationField[];
  editingFieldId: string | null;
  setEditingFieldId: React.Dispatch<React.SetStateAction<string | null>>;
  activeEvidenceFieldId: string | null;
  inspectorChecklist: {
    identity: boolean;
    declarations: boolean;
    corrections: boolean;
    evidence: boolean;
  };
  setInspectorChecklist: React.Dispatch<
    React.SetStateAction<{
      identity: boolean;
      declarations: boolean;
      corrections: boolean;
      evidence: boolean;
    }>
  >;
  finalReviewConfirmed: boolean;
  setFinalReviewConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
  reviewErrorNotice: string | null;
  setReviewErrorNotice: React.Dispatch<React.SetStateAction<string | null>>;
  onRunOcr: () => void;
  onStartManualReview: () => void;
  onReparseRawText: () => void;
  onUpdateDeclarationValue: (id: string, value: string) => void;
  onViewEvidence: (imageIndex: number, fieldId: string) => void;
  onBackToImageReview: () => void;
  onProceedToCompliance: () => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  ocrStatus,
  ocrProgressText,
  ocrError,
  ocrConfidenceScore,
  rawOcrText,
  editedRawOcrText,
  setEditedRawOcrText,
  isEditingRawText,
  setIsEditingRawText,
  showRawTextPanel,
  setShowRawTextPanel,
  declarations,
  editingFieldId,
  setEditingFieldId,
  activeEvidenceFieldId,
  inspectorChecklist,
  setInspectorChecklist,
  finalReviewConfirmed,
  setFinalReviewConfirmed,
  reviewErrorNotice,
  setReviewErrorNotice,
  onRunOcr,
  onStartManualReview,
  onReparseRawText,
  onUpdateDeclarationValue,
  onViewEvidence,
  onBackToImageReview,
  onProceedToCompliance,
}) => {
  return (
    <div className="space-y-6">
      {/* Loading OCR State */}
      {(ocrStatus === 'preparing' || ocrStatus === 'reading' || ocrStatus === 'identifying') && (
        <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-6 rounded-xs shadow-2xs text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs text-[10px] font-mono font-semibold uppercase text-[#667085]">
            03 / PROCESSING EVIDENCE
          </div>

          <div className="w-12 h-12 bg-[#E8F0FC] border border-[#D9DEE7] rounded-xs flex items-center justify-center mx-auto text-[#111827] animate-spin">
            <RotateCcw className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-lg font-serif font-bold text-[#111827]">
              Analyzing package
            </h3>
            <p className="text-xs text-[#667085] mt-1 font-mono">
              {ocrProgressText || 'Reading package text…'}
            </p>
          </div>

          <div className="bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs p-4 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[#111827]">1. Preparing image</span>
              <span className="text-[#287A52] font-bold">✓ Complete</span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span className="text-[#111827]">2. Reading visible text</span>
              <span className="text-[#071B3A] font-bold animate-pulse">
                {ocrStatus === 'reading' ? '● In progress' : '✓ Complete'}
              </span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span className={ocrStatus === 'identifying' ? 'text-[#111827] font-bold' : 'text-[#667085]'}>
                3. Identifying declarations
              </span>
              <span className="text-[#667085]">
                {ocrStatus === 'identifying' ? '● In progress' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[#667085]">
              <span>4. Preparing review</span>
              <span>Pending</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onStartManualReview}
            className="text-xs font-mono text-[#667085] hover:text-[#111827] underline cursor-pointer"
          >
            Skip OCR and review image manually
          </button>
        </div>
      )}

      {/* Error State */}
      {ocrStatus === 'error' && (
        <div className="bg-[#FFFFFF] border border-[#071B3A] p-6 rounded-xs shadow-2xs space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#C62828] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-serif font-bold text-[#111827]">
                Text extraction warning
              </h3>
              <p className="text-xs text-[#667085] mt-1">
                {ocrError || 'Text could not be extracted reliably from this image.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[#D9DEE7]">
            <button
              type="button"
              onClick={onStartManualReview}
              className="px-4 py-2 bg-[#071B3A] text-[#FFFFFF] text-xs font-semibold rounded-xs cursor-pointer hover:bg-[#0D2A55]"
            >
              Review image manually
            </button>
            <button
              type="button"
              onClick={onRunOcr}
              className="px-4 py-2 border border-[#D9DEE7] bg-[#FFFFFF] text-[#111827] text-xs font-medium rounded-xs cursor-pointer hover:bg-[#E8F0FC]"
            >
              Try OCR again
            </button>
          </div>
        </div>
      )}

      {/* Completed State */}
      {ocrStatus === 'completed' && (
        <div className="space-y-6">

          <div className="p-3 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold uppercase text-[10px] text-[#667085]">
                EXTRACTION STATUS:
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E8F0FC] border border-[#D9DEE7] rounded-2xs font-mono text-[10px] font-bold text-[#287A52]">
                ✓ COMPLETED
              </span>
              {ocrConfidenceScore !== null && (
                <span className="font-mono text-[11px] text-[#667085]">
                  ({ocrConfidenceScore >= 75 ? 'High confidence' : ocrConfidenceScore >= 50 ? 'Medium confidence' : 'Low confidence'})
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onRunOcr}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-[#667085] hover:text-[#111827] underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Re-run OCR</span>
            </button>
          </div>

          {/* Raw Text Panel */}
          <div className="bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs shadow-2xs overflow-hidden">
            <div className="p-3 bg-[#E8F0FC] border-b border-[#D9DEE7] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[#111827]" />
                <span className="text-xs font-mono font-bold uppercase text-[#111827]">
                  Extracted package text
                </span>
                <span className="text-[10px] font-mono text-[#667085]">
                  (Machine-extracted text)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (rawOcrText) {
                      navigator.clipboard.writeText(rawOcrText);
                    }
                  }}
                  className="text-[10px] font-mono text-[#667085] hover:text-[#111827] inline-flex items-center gap-1 cursor-pointer"
                  title="Copy raw text to clipboard"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRawTextPanel((prev) => !prev)}
                  className="text-[10px] font-mono text-[#667085] hover:text-[#111827] underline cursor-pointer"
                >
                  {showRawTextPanel ? 'Hide text' : 'Show text'}
                </button>
              </div>
            </div>

            {showRawTextPanel && (
              <div className="p-4 space-y-3">
                {isEditingRawText ? (
                  <div className="space-y-2">
                    <textarea
                      rows={5}
                      value={editedRawOcrText}
                      onChange={(e) => setEditedRawOcrText(e.target.value)}
                      className="w-full p-2.5 bg-[#FAFAFC] border border-[#071B3A] rounded-xs font-mono text-xs text-[#111827] focus:outline-none"
                      placeholder="Edit extracted text here…"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onReparseRawText}
                        className="px-3 py-1.5 bg-[#071B3A] text-[#FFFFFF] text-xs font-mono font-semibold rounded-xs cursor-pointer hover:bg-[#0D2A55]"
                      >
                        Reparse declarations
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditedRawOcrText(rawOcrText);
                          setIsEditingRawText(false);
                        }}
                        className="px-3 py-1.5 border border-[#D9DEE7] text-xs font-mono text-[#667085] rounded-xs cursor-pointer hover:bg-[#E8F0FC]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs font-mono text-xs text-[#111827] max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
                      {rawOcrText || <span className="text-[#667085] italic">No visible text extracted from this package.</span>}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#667085] font-mono">
                      <span>Review extracted text against the original package image before continuing.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditedRawOcrText(rawOcrText);
                          setIsEditingRawText(true);
                        }}
                        className="text-[#111827] underline hover:no-underline font-semibold cursor-pointer shrink-0 ml-2"
                      >
                        Edit text & reparse
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Declaration Categories Panel (8 Statutory Groups) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#D9DEE7]">
              <div>
                <h3 className="text-sm font-serif font-bold text-[#111827]">
                  Statutory Declarations
                </h3>
                <p className="text-[11px] text-[#667085]">
                  Legal Metrology (Packaged Commodities) Rules, 2011
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#667085]">
                8 CATEGORIES
              </span>
            </div>

            <div className="space-y-3">
              {declarations.map((field) => {
                const isFieldEditing = editingFieldId === field.id;

                return (
                  <div
                    key={field.id}
                    className={`p-3.5 bg-[#FFFFFF] border rounded-xs shadow-2xs space-y-2.5 transition-colors ${
                      activeEvidenceFieldId === field.id
                        ? 'border-[#071B3A] ring-1 ring-[#071B3A]'
                        : 'border-[#D9DEE7]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-[#667085]">
                          {field.categoryNumber}
                        </span>
                        <span className="text-xs font-mono font-bold uppercase text-[#111827]">
                          {field.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {field.status === 'DETECTED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#287A52]/10 border border-[#287A52]/30 text-[#287A52] text-[10px] font-mono font-bold rounded-2xs">
                            ✓ Detected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E8F0FC] border border-[#D9DEE7] text-[#667085] text-[10px] font-mono rounded-2xs">
                            — Not detected
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-[#667085] hidden sm:inline">
                          {field.confidence}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif font-bold text-[#111827]">
                        {field.label}
                      </span>
                      <span className="text-[10px] font-mono text-[#667085]">
                        {field.statutoryRuleRef}
                      </span>
                    </div>

                    {isFieldEditing ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          rows={2}
                          value={field.currentValue}
                          onChange={(e) => onUpdateDeclarationValue(field.id, e.target.value)}
                          className="w-full p-2 bg-[#FAFAFC] border border-[#071B3A] rounded-xs font-mono text-xs text-[#111827] focus:outline-none"
                          placeholder={`Enter statutory ${field.label.toLowerCase()}…`}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingFieldId(null)}
                            className="px-2.5 py-1 bg-[#071B3A] text-[#FFFFFF] text-[11px] font-mono font-semibold rounded-xs cursor-pointer hover:bg-[#0D2A55]"
                          >
                            Save declaration
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateDeclarationValue(field.id, field.extractedValue);
                              setEditingFieldId(null);
                            }}
                            className="px-2.5 py-1 border border-[#D9DEE7] text-[11px] font-mono text-[#667085] rounded-xs cursor-pointer hover:bg-[#E8F0FC]"
                          >
                            Reset to extracted
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs flex items-start justify-between gap-3 text-xs">
                        <div className="font-mono text-[#111827] whitespace-pre-wrap select-text leading-relaxed">
                          {field.currentValue || (
                            <span className="text-[#667085] italic font-sans text-xs">
                              Not detected in visible package text.
                            </span>
                          )}
                          {field.isEdited && (
                            <span className="inline-block ml-2 px-1.5 py-0.2 bg-[#FFFFFF] border border-[#071B3A] text-[9px] font-mono font-bold text-[#111827] rounded-2xs">
                              Edited by inspector
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => onViewEvidence(field.evidenceImageIndex, field.id)}
                            className="text-[11px] font-mono text-[#667085] hover:text-[#111827] underline cursor-pointer"
                            title="Inspect associated image view"
                          >
                            View evidence
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingFieldId(field.id)}
                            className="p-1 text-[#667085] hover:text-[#111827] border border-transparent hover:border-[#D9DEE7] rounded-2xs cursor-pointer"
                            title="Edit declaration"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Confirmation Area */}
          <div className="bg-[#FFFFFF] border border-[#071B3A] p-5 rounded-xs shadow-2xs space-y-4">
            <div className="border-b border-[#D9DEE7] pb-2">
              <div className="text-[10px] font-mono font-bold uppercase text-[#667085]">
                INSPECTION CONFIRMATION
              </div>
              <h4 className="text-sm font-serif font-bold text-[#111827]">
                Inspector review
              </h4>
              <p className="text-xs text-[#667085]">
                Confirm that extracted declarations match the original package.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inspectorChecklist.identity}
                  onChange={(e) =>
                    setInspectorChecklist((prev) => ({ ...prev, identity: e.target.checked }))
                  }
                  className="mt-0.5 accent-[#071B3A]"
                />
                <span className="text-[#111827]">
                  <strong>Package identity reviewed:</strong> Verified commodity type and package surfaces.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inspectorChecklist.declarations}
                  onChange={(e) =>
                    setInspectorChecklist((prev) => ({ ...prev, declarations: e.target.checked }))
                  }
                  className="mt-0.5 accent-[#071B3A]"
                />
                <span className="text-[#111827]">
                  <strong>Declarations reviewed:</strong> Checked all 8 statutory categories for presence.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inspectorChecklist.corrections}
                  onChange={(e) =>
                    setInspectorChecklist((prev) => ({ ...prev, corrections: e.target.checked }))
                  }
                  className="mt-0.5 accent-[#071B3A]"
                />
                <span className="text-[#111827]">
                  <strong>OCR corrections completed:</strong> Corrected any misread characters or numbers.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inspectorChecklist.evidence}
                  onChange={(e) =>
                    setInspectorChecklist((prev) => ({ ...prev, evidence: e.target.checked }))
                  }
                  className="mt-0.5 accent-[#071B3A]"
                />
                <span className="text-[#111827]">
                  <strong>Image evidence checked:</strong> Cross-checked high-resolution photos for legibility.
                </span>
              </label>
            </div>

            <div className="pt-3 border-t border-[#D9DEE7] space-y-3">
              <label className="flex items-center gap-2.5 p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={finalReviewConfirmed}
                  onChange={(e) => {
                    setFinalReviewConfirmed(e.target.checked);
                    if (e.target.checked) {
                      setReviewErrorNotice(null);
                    }
                  }}
                  className="w-4 h-4 accent-[#071B3A]"
                />
                <span className="text-xs font-serif font-bold text-[#111827]">
                  I have reviewed the extracted declarations.
                </span>
              </label>

              {reviewErrorNotice && (
                <div className="p-3 bg-[#FFFFFF] border border-[#C62828] rounded-xs text-xs text-[#C62828] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#C62828]" />
                  <span>{reviewErrorNotice}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={onBackToImageReview}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Image Review</span>
                </button>

                <button
                  type="button"
                  onClick={onProceedToCompliance}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
                >
                  <span>Continue to Compliance Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
