/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Plus,
  ArrowRight,
  ChevronRight,
  History,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { InspectionReport } from '../types';
import { deriveProductCatalog } from '../lib/compliance';

interface DashboardProps {
  reports: InspectionReport[];
  navigate: (path: string) => void;
  onOpenGuidance: () => void;
  onSelectInspection: (id: string) => void;
  onSelectProduct: (productName: string) => void;
  onSelectReport?: (id: string) => void;
}

export function Dashboard({
  reports,
  navigate,
  onOpenGuidance,
  onSelectInspection,
  onSelectProduct,
  onSelectReport,
}: DashboardProps) {
  const totalCount = reports.length;
  const compliantCount = reports.filter((r) => r.overallStatus === 'COMPLIANT').length;
  const needsReviewCount = reports.filter((r) => r.overallStatus === 'NEEDS REVIEW' || r.overallStatus === 'INCONCLUSIVE').length;
  const violationCount = reports.filter((r) => r.overallStatus === 'NON-COMPLIANT').length;
  const catalogedProducts = deriveProductCatalog(reports);

  return (
    <div className="space-y-8">
      {/* Overview Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D9DEE7]">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-[#111827] leading-tight mb-1">
            Inspection overview
          </h2>
          <p className="text-xs sm:text-sm text-[#667085]">
            Review your inspection workspace and begin a new compliance check.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/history')}
            className="px-3.5 py-2 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
          >
            View Inspection History
          </button>

          <button
            onClick={() => navigate('/inspection')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-medium rounded-xs transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start New Inspection</span>
          </button>
        </div>
      </div>

      {/* ─── DASHBOARD HERO / STATUS SECTION ─── */}
      <section className="bg-[#FFFFFF] border border-[#D9DEE7] p-6 sm:p-8 lg:p-10 rounded-xs shadow-2xs relative overflow-hidden">
        <div className="max-w-2xl">
          {/* Subtle Institutional Inspection Document Graphic */}
          <div className="w-14 h-14 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs flex items-center justify-center text-[#111827] mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>

          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#E8F0FC] border border-[#D9DEE7] rounded-xs text-[10px] font-mono font-semibold uppercase tracking-wider text-[#667085] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#071B3A]"></span>
            WORKSPACE ACTIVE • {totalCount} RECORDED INSPECTION{totalCount === 1 ? '' : 'S'}
            {catalogedProducts.length > 0 && ` • ${catalogedProducts.length} CATALOGED COMMODIT${catalogedProducts.length === 1 ? 'Y' : 'IES'}`}
          </div>

          <h3 className="text-xl sm:text-2xl font-serif text-[#111827] mb-3 leading-snug">
            {totalCount > 0
              ? 'Legal Metrology inspection register active.'
              : 'Your inspection workspace is ready.'}
          </h3>

          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed mb-6 max-w-xl">
            {totalCount > 0
              ? `You have recorded ${totalCount} packaged commodity inspection${totalCount === 1 ? '' : 's'} with ${catalogedProducts.length} registered product profile${catalogedProducts.length === 1 ? '' : 's'}. You can start another inspection or review historical records.`
              : 'Start an inspection to capture package information, verify mandatory declarations and document your findings.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => navigate('/inspection')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-medium rounded-xs transition-colors cursor-pointer shadow-2xs"
            >
              <span>Start New Inspection</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FFFFFF]/80" />
            </button>

            <button
              onClick={onOpenGuidance}
              className="text-xs font-medium text-[#111827] hover:underline cursor-pointer py-1"
            >
              Learn how inspections work →
            </button>
          </div>
        </div>
      </section>

      {/* ─── 01 / QUICK ACTIONS AREA ─── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#667085]">
            01 / QUICK ACTIONS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1: Start Inspection */}
          <button
            onClick={() => navigate('/inspection')}
            className="bg-[#FFFFFF] border border-[#D9DEE7] p-5 rounded-xs text-left hover:border-[#071B3A] transition-colors group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827]">
                  START INSPECTION
                </span>
                <ArrowRight className="w-4 h-4 text-[#667085] group-hover:text-[#111827] group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-[#667085] leading-relaxed">
                Begin a new packaged commodity inspection.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#D9DEE7] text-[11px] font-mono text-[#667085]">
              Route: /inspection
            </div>
          </button>

          {/* Action 2: Inspection History */}
          <button
            onClick={() => navigate('/history')}
            className="bg-[#FFFFFF] border border-[#D9DEE7] p-5 rounded-xs text-left hover:border-[#071B3A] transition-colors group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827]">
                  INSPECTION HISTORY
                </span>
                <ArrowRight className="w-4 h-4 text-[#667085] group-hover:text-[#111827] group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-[#667085] leading-relaxed">
                {totalCount > 0 ? `Access ${totalCount} recorded inspection log${totalCount === 1 ? '' : 's'}.` : 'Review previously completed inspections.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#D9DEE7] text-[11px] font-mono text-[#667085]">
              Route: /history
            </div>
          </button>

          {/* Action 3: Products */}
          <button
            onClick={() => navigate('/products')}
            className="bg-[#FFFFFF] border border-[#D9DEE7] p-5 rounded-xs text-left hover:border-[#071B3A] transition-colors group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827]">
                  PRODUCT REPOSITORY
                </span>
                <ArrowRight className="w-4 h-4 text-[#667085] group-hover:text-[#111827] group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-[#667085] leading-relaxed">
                {catalogedProducts.length > 0 ? `View ${catalogedProducts.length} cataloged packaged commodity profile${catalogedProducts.length === 1 ? '' : 's'}.` : 'Cataloged commodities register.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#D9DEE7] text-[11px] font-mono text-[#667085]">
              Route: /products
            </div>
          </button>
        </div>
      </section>

      {/* ─── 02 / COMPLIANCE STATUS AREA ─── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#667085]">
            02 / COMPLIANCE STATUS
          </span>
          <span className="text-[10px] font-mono text-[#667085]">
            {totalCount > 0 ? `RECORDED AUDITS: ${totalCount}` : 'AWAITING FIRST INSPECTION'}
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-5 rounded-xs">
          <div className="mb-4">
            <h4 className="text-sm font-serif font-bold text-[#111827] mb-1">
              Compliance activity
            </h4>
            <p className="text-xs text-[#667085]">
              {totalCount > 0
                ? 'Aggregate determination results across all verified packaged commodity packages.'
                : 'Compliance findings will appear here after inspections are completed.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {/* Category 1: Compliant */}
            <div className="p-3.5 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#287A52]"></span>
                <div>
                  <div className="text-xs font-mono font-bold uppercase text-[#111827]">
                    COMPLIANT
                  </div>
                  <div className="text-[11px] text-[#667085]">
                    {totalCount > 0 ? `${compliantCount} of ${totalCount} packages passed` : 'No inspection data yet'}
                  </div>
                </div>
              </div>
              <span className="text-base font-serif font-bold text-[#111827]">
                {totalCount > 0 ? compliantCount : '—'}
              </span>
            </div>

            {/* Category 2: Needs Review */}
            <div className="p-3.5 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#B7791F]"></span>
                <div>
                  <div className="text-xs font-mono font-bold uppercase text-[#111827]">
                    NEEDS REVIEW
                  </div>
                  <div className="text-[11px] text-[#667085]">
                    {totalCount > 0 ? `${needsReviewCount} of ${totalCount} require review` : 'No inspection data yet'}
                  </div>
                </div>
              </div>
              <span className="text-base font-serif font-bold text-[#111827]">
                {totalCount > 0 ? needsReviewCount : '—'}
              </span>
            </div>

            {/* Category 3: Violation */}
            <div className="p-3.5 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#C62828]"></span>
                <div>
                  <div className="text-xs font-mono font-bold uppercase text-[#111827]">
                    VIOLATION
                  </div>
                  <div className="text-[11px] text-[#667085]">
                    {totalCount > 0 ? `${violationCount} of ${totalCount} flagged non-compliant` : 'No inspection data yet'}
                  </div>
                </div>
              </div>
              <span className="text-base font-serif font-bold text-[#111827]">
                {totalCount > 0 ? violationCount : '—'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 03 / RECENT INSPECTIONS AREA ─── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#667085]">
            03 / RECENT RECORDS
          </span>
          {totalCount > 0 && (
            <button
              onClick={() => navigate('/history')}
              className="text-xs font-medium text-[#111827] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View all {totalCount} records</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {totalCount === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-6 sm:p-8 rounded-xs text-center">
            <div className="max-w-md mx-auto py-4">
              <div className="w-10 h-10 bg-[#E8F0FC] border border-[#D9DEE7] rounded-xs flex items-center justify-center mx-auto mb-3 text-[#667085]">
                <History className="w-5 h-5" />
              </div>

              <h4 className="text-base font-serif font-bold text-[#111827] mb-1">
                Recent inspections
              </h4>

              <p className="text-xs font-medium text-[#111827] mb-1">
                No inspections have been recorded yet.
              </p>

              <p className="text-xs text-[#667085] leading-relaxed mb-5">
                Completed inspections will appear here with their product, status and inspection date.
              </p>

              <button
                onClick={() => navigate('/inspection')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-medium rounded-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start an Inspection</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs divide-y divide-[#D9DEE7] overflow-hidden">
            {reports.slice(0, 5).map((report) => (
              <div
                key={report.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFAFC]/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#111827]">
                      {report.referenceNumber || report.id}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold uppercase rounded-xs border ${
                        report.overallStatus === 'COMPLIANT'
                          ? 'bg-[#EAF5EF] text-[#287A52] border-[#287A52]'
                          : report.overallStatus === 'NON-COMPLIANT'
                          ? 'bg-[#FDF2F2] text-[#C62828] border-[#C62828]'
                          : 'bg-[#FEF8EC] text-[#B7791F] border-[#B7791F]'
                      }`}
                    >
                      {report.overallStatus}
                    </span>
                    <span className="text-[11px] font-mono text-[#667085]">
                      {report.inspectionDate}
                    </span>
                  </div>

                  <h5 className="text-sm font-serif font-bold text-[#111827]">
                    {report.productName || 'Unlabeled Commodity'}
                  </h5>

                  <p className="text-xs text-[#667085] truncate max-w-lg">
                    {report.manufacturer || 'Manufacturer Not Declared'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectInspection(report.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Record</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── GUIDANCE PANEL (Statutory Checklist) ─── */}
      <section className="bg-[#FFFFFF] border border-[#D9DEE7] p-5 sm:p-6 rounded-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7] mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#111827]" />
            <h4 className="text-sm font-serif font-bold text-[#111827]">
              Before you begin
            </h4>
          </div>
          <span className="text-[10px] font-mono uppercase text-[#667085]">
            L.M. (P.C.) RULES 2011
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
            <span className="block font-mono text-xs font-bold text-[#111827] mb-1.5">01</span>
            <p className="text-xs text-[#667085] leading-relaxed">
              Capture clear package images.
            </p>
          </div>

          <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
            <span className="block font-mono text-xs font-bold text-[#111827] mb-1.5">02</span>
            <p className="text-xs text-[#667085] leading-relaxed">
              Ensure mandatory declarations are visible.
            </p>
          </div>

          <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
            <span className="block font-mono text-xs font-bold text-[#111827] mb-1.5">03</span>
            <p className="text-xs text-[#667085] leading-relaxed">
              Review extracted information before submitting.
            </p>
          </div>

          <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
            <span className="block font-mono text-xs font-bold text-[#111827] mb-1.5">04</span>
            <p className="text-xs text-[#667085] leading-relaxed">
              Keep supporting evidence with the inspection record.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
