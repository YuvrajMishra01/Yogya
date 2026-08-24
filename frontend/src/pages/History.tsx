/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  History as HistoryIcon,
  Search,
  X,
  ArrowUpDown,
  Filter,
  Calendar,
  FileText,
  FileDown,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  Package,
  Check,
  Copy,
  Printer,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ZoomIn,
  Edit3,
} from 'lucide-react';
import { InspectionReport } from '../types';
import { exportReportAsHtml } from '../lib/compliance';

interface HistoryProps {
  reports: InspectionReport[];
  selectedInspectionId: string | null;
  onSelectInspection: (id: string | null) => void;
  onSelectReport: (id: string) => void;
  onSelectProduct: (productName: string) => void;
  onDeleteInspection: (id: string) => void;
  onUpdateObservation?: (id: string, observations: string) => void;
  navigate: (path: string) => void;
}

export function History({
  reports,
  selectedInspectionId,
  onSelectInspection,
  onSelectReport,
  onSelectProduct,
  onDeleteInspection,
  onUpdateObservation,
  navigate,
}: HistoryProps) {
  const selectedReport = reports.find((r) => r.id === selectedInspectionId);

  if (selectedInspectionId && selectedReport) {
    return (
      <InspectionDetailView
        report={selectedReport}
        onBack={() => onSelectInspection(null)}
        onSelectProduct={onSelectProduct}
        onSelectReport={onSelectReport}
        onUpdateObservation={(obs) => onUpdateObservation && onUpdateObservation(selectedInspectionId, obs)}
        onDeleteInspection={onDeleteInspection}
        navigate={navigate}
      />
    );
  }

  return (
    <HistoryListView
      reports={reports}
      onSelectInspection={onSelectInspection}
      onSelectReport={onSelectReport}
      onSelectProduct={onSelectProduct}
      onDeleteInspection={onDeleteInspection}
      navigate={navigate}
    />
  );
}

function HistoryListView({
  reports,
  onSelectInspection,
  onSelectReport,
  onSelectProduct,
  onDeleteInspection,
  navigate,
}: {
  reports: InspectionReport[];
  onSelectInspection: (id: string) => void;
  onSelectReport: (id: string) => void;
  onSelectProduct: (productName: string) => void;
  onDeleteInspection: (id: string) => void;
  navigate: (path: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState<'ALL' | 'COMPLIANT' | 'NEEDS REVIEW' | 'NON-COMPLIANT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Completed' | 'Under Review'>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered and sorted reports list
  const filteredReports = reports
    .filter((report) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (report.id && report.id.toLowerCase().includes(q)) ||
        (report.referenceNumber && report.referenceNumber.toLowerCase().includes(q)) ||
        (report.productName && report.productName.toLowerCase().includes(q)) ||
        (report.manufacturer && report.manufacturer.toLowerCase().includes(q)) ||
        (report.address && report.address.toLowerCase().includes(q));

      const matchesResult =
        resultFilter === 'ALL' ||
        (resultFilter === 'NEEDS REVIEW'
          ? report.overallStatus === 'NEEDS REVIEW' || report.overallStatus === 'INCONCLUSIVE'
          : report.overallStatus === resultFilter);

      const matchesStatus =
        statusFilter === 'ALL' || (report.status || 'Completed') === statusFilter;

      return matchesSearch && matchesResult && matchesStatus;
    })
    .sort((a, b) => {
      const timeA = a.createdAt || 0;
      const timeB = b.createdAt || 0;
      return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
    });

  const totalCount = reports.length;
  const compliantCount = reports.filter((r) => r.overallStatus === 'COMPLIANT').length;
  const needsReviewCount = reports.filter((r) => r.overallStatus === 'NEEDS REVIEW' || r.overallStatus === 'INCONCLUSIVE').length;
  const violationCount = reports.filter((r) => r.overallStatus === 'NON-COMPLIANT').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="pb-4 border-b border-[#D9DEE7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#111827]">
            Inspection history
          </h2>
          <p className="text-xs sm:text-sm text-[#667085]">
            Archived logs and statutory determinations of packaged commodity verifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/inspection')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Inspection</span>
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        /* Empty State */
        <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-8 sm:p-14 rounded-xs text-center max-w-xl mx-auto shadow-2xs space-y-4">
          <div className="w-12 h-12 bg-[#E8F0FC] border border-[#D9DEE7] rounded-xs flex items-center justify-center mx-auto text-[#111827]">
            <HistoryIcon className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-serif font-bold text-[#111827]">
            No inspection records yet.
          </h3>

          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
            Completed inspection archives and past compliance determinations will be cataloged here as soon as you perform an audit.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/inspection')}
              className="px-4 py-2 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
            >
              Start First Inspection
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
            >
              Back to Overview
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-4 rounded-xs">
              <div className="text-[10px] font-mono uppercase text-[#667085] mb-1">
                Total Inspections
              </div>
              <div className="text-2xl font-serif font-bold text-[#111827]">
                {totalCount}
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-4 rounded-xs">
              <div className="text-[10px] font-mono uppercase text-[#287A52] mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#287A52]"></span>
                <span>Compliant</span>
              </div>
              <div className="text-2xl font-serif font-bold text-[#287A52]">
                {compliantCount}
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-4 rounded-xs">
              <div className="text-[10px] font-mono uppercase text-[#B7791F] mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B7791F]"></span>
                <span>Needs Review</span>
              </div>
              <div className="text-2xl font-serif font-bold text-[#B7791F]">
                {needsReviewCount}
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-4 rounded-xs">
              <div className="text-[10px] font-mono uppercase text-[#C62828] mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C62828]"></span>
                <span>Violations</span>
              </div>
              <div className="text-2xl font-serif font-bold text-[#C62828]">
                {violationCount}
              </div>
            </div>
          </div>

          {/* Search, Filters and Sorting Bar */}
          <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-4 rounded-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by reference ID, product name, manufacturer or address..."
                  className="w-full pl-9 pr-4 py-2 bg-[#FFFFFF] border border-[#D9DEE7] focus:border-[#071B3A] focus:ring-1 focus:ring-[#071B3A] text-xs text-[#111827] rounded-xs outline-hidden placeholder-[#98A2B3]/50 transition-colors font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#111827]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Order Selector */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setSortOrder(sortOrder === 'NEWEST' ? 'OLDEST' : 'NEWEST')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#D9DEE7] bg-[#FAFAFC] hover:bg-[#E8F0FC] text-xs font-mono text-[#111827] rounded-xs transition-colors cursor-pointer"
                  title="Toggle Chronological Sorting"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#667085]" />
                  <span>{sortOrder === 'NEWEST' ? 'Newest First' : 'Oldest First'}</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#D9DEE7]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-mono text-[#667085] mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  <span>Result:</span>
                </span>
                {(['ALL', 'COMPLIANT', 'NEEDS REVIEW', 'NON-COMPLIANT'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setResultFilter(filter)}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-xs transition-colors cursor-pointer ${
                      resultFilter === filter
                        ? 'bg-[#071B3A] text-[#FFFFFF] font-semibold'
                        : 'bg-[#FAFAFC] text-[#667085] hover:bg-[#E8F0FC] hover:text-[#111827]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-[#667085] mr-1">Status:</span>
                {(['ALL', 'Completed', 'Under Review'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-xs transition-colors cursor-pointer ${
                      statusFilter === status
                        ? 'bg-[#071B3A] text-[#FFFFFF] font-semibold'
                        : 'bg-[#FAFAFC] text-[#667085] hover:bg-[#E8F0FC] hover:text-[#111827]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Inspection Records List */}
          <div className="bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs shadow-2xs overflow-hidden">
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center text-[#667085] space-y-2">
                <p className="text-sm font-medium text-[#111827]">
                  No inspection records match the selected filters.
                </p>
                <p className="text-xs">
                  Try adjusting your search keywords or clearing active filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setResultFilter('ALL');
                    setStatusFilter('ALL');
                  }}
                  className="mt-2 text-xs font-mono underline text-[#111827] cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#D9DEE7]">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAFAFC]/50 transition-colors"
                  >
                    <div className="space-y-2 flex-1">
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

                        <span className="text-[11px] font-mono text-[#667085] flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{report.inspectionDate}</span>
                        </span>

                        <span className="text-[11px] font-mono text-[#667085] px-1.5 py-0.5 bg-[#E8F0FC] rounded-2xs">
                          {report.status || 'Completed'}
                        </span>
                      </div>

                      <div>
                        <button
                          onClick={() => onSelectProduct(report.productName)}
                          className="text-base font-serif font-bold text-[#111827] hover:underline cursor-pointer text-left block"
                        >
                          {report.productName || 'Unidentified Commodity'}
                        </button>
                        <p className="text-xs text-[#667085] font-mono truncate max-w-xl">
                          {report.manufacturer || 'Manufacturer Not Declared'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#667085]">
                        <span>
                          <strong className="text-[#111827]">Net Qty:</strong> {report.netQuantity || 'N/A'}
                        </span>
                        <span>•</span>
                        <span>
                          <strong className="text-[#111827]">MRP:</strong> {report.mrp || 'N/A'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="text-[#287A52] font-semibold">✓ {report.stats?.passed ?? 0}</span>
                          <span className="text-[#B7791F] font-semibold">⚠ {report.stats?.needsReview ?? 0}</span>
                          <span className="text-[#C62828] font-semibold">✗ {report.stats?.failed ?? 0}</span>
                        </span>
                        <span>•</span>
                        <span>
                          {report.evidenceImages?.length || 0} evidence {(report.evidenceImages?.length || 0) === 1 ? 'photo' : 'photos'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#D9DEE7]/60 shrink-0">
                      <button
                        onClick={() => onSelectInspection(report.id)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => onSelectReport(report.id)}
                        title="Open Official Report Document"
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 sm:py-1.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
                      >
                        Report
                      </button>

                      <button
                        onClick={() => exportReportAsHtml(report)}
                        title="Download Standalone HTML Report"
                        className="p-2 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-[#667085] hover:text-[#111827] rounded-xs transition-colors cursor-pointer"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(report.id)}
                        title="Delete Inspection Record"
                        className="p-2 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#C62828]/10 text-[#667085] hover:text-[#C62828] rounded-xs transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 bg-[#071B3A]/70 backdrop-blur-2xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs p-6 max-w-md w-full shadow-2xl space-y-4 z-10 text-[#111827]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xs bg-[#C62828]/10 text-[#C62828] flex items-center justify-center border border-[#C62828]/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#111827]">
                    Delete Inspection Record?
                  </h3>
                  <p className="text-xs text-[#667085] font-mono">
                    Ref: {deleteConfirmId}
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#667085] leading-relaxed">
                This will permanently delete this inspection record, declarations scrutiny, and photographic evidence from the local database.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D9DEE7]">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-3.5 py-1.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteInspection(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="px-4 py-1.5 bg-[#C62828] hover:bg-[#B71C1C] text-[#FFFFFF] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InspectionDetailView({
  report,
  onBack,
  onSelectProduct,
  onSelectReport,
  onUpdateObservation,
  onDeleteInspection,
  navigate,
}: {
  report: InspectionReport;
  onBack: () => void;
  onSelectProduct: (productName: string) => void;
  onSelectReport: (id: string) => void;
  onUpdateObservation: (observations: string) => void;
  onDeleteInspection: (id: string) => void;
  navigate: (path: string) => void;
}) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(report.observations || '');
  const [zoomImage, setZoomImage] = useState<{ id: string; previewUrl: string; name: string; relatedRequirement?: string; description: string } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handlePrint = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      window.focus();
      window.print();
    } catch (err) {
      console.error('Failed to trigger window.print:', err);
    }
  };

  const handleSaveNotes = () => {
    onUpdateObservation(notesText);
    setIsEditingNotes(false);
  };

  const handleCopySummary = () => {
    const summary = `YOGYA INSPECTION RECORD
Reference: ${report.referenceNumber || report.id}
Date: ${report.inspectionDate}
Product: ${report.productName || 'N/A'}
Manufacturer: ${report.manufacturer || 'N/A'}
Determination: ${report.overallStatus}
Net Quantity: ${report.netQuantity || 'N/A'}
MRP: ${report.mrp || 'N/A'}
Passed: ${report.stats?.passed ?? 0} | Review: ${report.stats?.needsReview ?? 0} | Violations: ${report.stats?.failed ?? 0}`;
    navigator.clipboard.writeText(summary);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Action Bar */}
      <div className="pb-4 border-b border-[#D9DEE7] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to History</span>
          </button>

          <button
            onClick={() => onSelectProduct(report.productName)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
          >
            <Package className="w-3.5 h-3.5 text-[#667085]" />
            <span>Product Profile</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
          >
            {copySuccess ? <Check className="w-3.5 h-3.5 text-[#287A52]" /> : <Copy className="w-3.5 h-3.5 text-[#667085]" />}
            <span>{copySuccess ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#667085]" />
            <span>Print</span>
          </button>

          <button
            onClick={() => exportReportAsHtml(report)}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#667085]" />
            <span>Export HTML</span>
          </button>

          <button
            onClick={() => onSelectReport(report.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Formal Report</span>
          </button>
        </div>
      </div>

      {/* Main Inspection Dossier Card */}
      <div className="bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs p-6 sm:p-8 shadow-2xs space-y-8">
        {/* Dossier Header */}
        <div className="border-b border-[#D9DEE7] pb-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#E8F0FC] border border-[#D9DEE7] rounded-xs text-[10px] font-mono uppercase text-[#667085]">
              <span>LEGAL METROLOGY INSPECTION RECORD</span>
              <span>•</span>
              <span className="text-[#111827] font-bold">{report.referenceNumber || report.id}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#111827]">
              {report.productName || 'Unlabeled Commodity'}
            </h1>

            <p className="text-xs text-[#667085] font-mono">
              Audited under Legal Metrology (Packaged Commodities) Rules, 2011
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-2 shrink-0">
            <div
              className={`px-4 py-2 rounded-xs border text-center ${
                report.overallStatus === 'COMPLIANT'
                  ? 'bg-[#EAF5EF] text-[#287A52] border-[#287A52]'
                  : report.overallStatus === 'NON-COMPLIANT'
                  ? 'bg-[#FDF2F2] text-[#C62828] border-[#C62828]'
                  : 'bg-[#FEF8EC] text-[#B7791F] border-[#B7791F]'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                STATUTORY VERDICT
              </div>
              <div className="text-base font-serif font-bold tracking-tight">
                {report.overallStatus}
              </div>
            </div>

            <div className="text-[11px] font-mono text-[#667085]">
              Date: {report.inspectionDate}
            </div>
          </div>
        </div>

        {/* Section 1: Commodity Profile & Declared Attributes */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#D9DEE7]">
            <h3 className="text-xs font-mono font-bold uppercase text-[#667085]">
              01 / COMMODITY ATTRIBUTES & REGISTERED DETAILS
            </h3>
            <button
              onClick={() => onSelectProduct(report.productName)}
              className="text-xs font-mono text-[#111827] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View in Product Catalog</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#667085]">Product Name</span>
              <p className="font-semibold text-[#111827]">{report.productName || 'Not detected'}</p>
            </div>

            <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#667085]">Manufacturer / Packer</span>
              <p className="font-semibold text-[#111827]">{report.manufacturer || 'Not detected'}</p>
            </div>

            <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#667085]">Net Quantity</span>
              <p className="font-semibold text-[#111827]">{report.netQuantity || 'Not detected'}</p>
            </div>

            <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#667085]">Maximum Retail Price (MRP)</span>
              <p className="font-semibold text-[#111827]">{report.mrp || 'Not detected'}</p>
            </div>

            <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#667085]">Manufacturing / Pkg Date</span>
              <p className="font-semibold text-[#111827]">{report.dateInfo || 'Not detected'}</p>
            </div>

            <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#667085]">Country of Origin</span>
              <p className="font-semibold text-[#111827]">{report.countryOfOrigin || 'Not detected'}</p>
            </div>

            <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-1 sm:col-span-2">
              <span className="text-[10px] font-mono uppercase text-[#667085]">Consumer Care Contact</span>
              <p className="font-semibold text-[#111827]">{report.consumerCare || 'Not detected'}</p>
            </div>

            <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#667085]">Audit Status</span>
              <p className="font-semibold text-[#111827]">{report.status || 'Completed'}</p>
            </div>
          </div>
        </section>

        {/* Section 2: Statutory Compliance Determination */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase text-[#667085] pb-2 border-b border-[#D9DEE7]">
            02 / STATUTORY DETERMINATION & AUDIT SCORECARD
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#287A52]" />
                <div>
                  <div className="text-xs font-mono font-bold text-[#111827]">Passed Rules</div>
                  <div className="text-[10px] text-[#667085]">Satisfies statutory thresholds</div>
                </div>
              </div>
              <span className="text-xl font-serif font-bold text-[#287A52]">
                {report.stats?.passed ?? 0}
              </span>
            </div>

            <div className="p-4 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#B7791F]" />
                <div>
                  <div className="text-xs font-mono font-bold text-[#111827]">Review Items</div>
                  <div className="text-[10px] text-[#667085]">Discretionary or ambiguous</div>
                </div>
              </div>
              <span className="text-xl font-serif font-bold text-[#B7791F]">
                {report.stats?.needsReview ?? 0}
              </span>
            </div>

            <div className="p-4 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#C62828]" />
                <div>
                  <div className="text-xs font-mono font-bold text-[#111827]">Violations</div>
                  <div className="text-[10px] text-[#667085]">Non-compliant deficiencies</div>
                </div>
              </div>
              <span className="text-xl font-serif font-bold text-[#C62828]">
                {report.stats?.failed ?? 0}
              </span>
            </div>
          </div>
        </section>

        {/* Section 3: Extracted Declarations & Rule Verification Matrix */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase text-[#667085] pb-2 border-b border-[#D9DEE7]">
            03 / MANDATORY DECLARATIONS SCRUTINY MATRIX
          </h3>

          <div className="border border-[#D9DEE7] rounded-xs overflow-hidden">
            {/* Mobile Stacked View */}
            <div className="sm:hidden divide-y divide-[#D9DEE7]">
              {(report.declarations || []).map((field) => (
                <div key={field.id} className="p-3.5 space-y-2 hover:bg-[#FAFAFC]/40">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs text-[#111827]">{field.label}</div>
                      <div className="font-mono text-[10px] text-[#667085]">{field.statutoryRuleRef}</div>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase font-semibold rounded-xs border ${
                        field.status === 'DETECTED'
                          ? 'bg-[#EAF5EF] text-[#287A52] border-[#287A52]'
                          : field.status === 'NOT_DETECTED'
                          ? 'bg-[#FDF2F2] text-[#C62828] border-[#C62828]'
                          : 'bg-[#FEF8EC] text-[#B7791F] border-[#B7791F]'
                      }`}
                    >
                      {field.status === 'DETECTED' ? 'DETECTED' : field.status === 'NOT_DETECTED' ? 'NOT DETECTED' : 'REVIEW REQUIRED'}
                    </span>
                  </div>

                  <div className="text-xs">
                    <div className="text-[10px] font-mono text-[#667085] uppercase mb-0.5">Detected Value:</div>
                    <div className="font-mono text-[#111827] bg-[#FAFAFC] p-2 rounded-xs border border-[#D9DEE7]">
                      {field.currentValue ? field.currentValue : <span className="text-[#667085] italic">Not detected on package</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className="hidden sm:table w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAFAFC] border-b border-[#D9DEE7] font-mono text-[10px] text-[#667085] uppercase">
                  <th className="p-3">Requirement & Rule</th>
                  <th className="p-3">Detected Value from Packaging</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DEE7]">
                {(report.declarations || []).map((field) => (
                  <tr key={field.id} className="hover:bg-[#FAFAFC]/40">
                    <td className="p-3 align-top">
                      <div className="font-bold text-[#111827]">{field.label}</div>
                      <div className="font-mono text-[10px] text-[#667085]">{field.statutoryRuleRef}</div>
                    </td>
                    <td className="p-3 align-top">
                      <div className="font-mono text-[#111827]">
                        {field.currentValue ? field.currentValue : <span className="text-[#667085] italic">Not detected on package</span>}
                      </div>
                    </td>
                    <td className="p-3 align-top whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase font-semibold rounded-xs border ${
                          field.status === 'DETECTED'
                            ? 'bg-[#EAF5EF] text-[#287A52] border-[#287A52]'
                            : field.status === 'NOT_DETECTED'
                            ? 'bg-[#FDF2F2] text-[#C62828] border-[#C62828]'
                            : 'bg-[#FEF8EC] text-[#B7791F] border-[#B7791F]'
                        }`}
                      >
                        {field.status === 'DETECTED' ? 'DETECTED' : field.status === 'NOT_DETECTED' ? 'NOT DETECTED' : 'REVIEW REQUIRED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Compliance Findings / Violations Breakdown */}
        {report.findings && report.findings.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-[#667085] pb-2 border-b border-[#D9DEE7]">
              04 / COMPLIANCE FINDINGS & DEFICIENCIES
            </h3>

            <div className="space-y-2.5">
              {report.findings.map((finding) => {
                const isPassed = finding.status === 'PASSED';
                const isReview = finding.status === 'NEEDS_REVIEW' || (finding.status as string) === 'REVIEW';
                const rowBg = isPassed ? 'bg-[#F1F8F4]' : isReview ? 'bg-[#FFF9EC]' : 'bg-[#FDF1F1]';
                const leftBorder = isPassed ? 'border-l-[3.5px] border-l-[#4CAF7D]' : isReview ? 'border-l-[3.5px] border-l-[#D9A441]' : 'border-l-[3.5px] border-l-[#D96B6B]';
                const badgeStyle = isPassed ? 'bg-[#EAF6EF] text-[#4CAF7D] border border-[#4CAF7D]/30' : isReview ? 'bg-[#FFF5DF] text-[#D9A441] border border-[#D9A441]/40' : 'bg-[#FCECEC] text-[#D96B6B] border border-[#D96B6B]/40';
                const label = isPassed ? 'PASSED' : isReview ? 'REVIEW' : 'NON-COMPLIANT';

                return (
                  <div
                    key={finding.id}
                    className={`p-4 rounded-xs border border-[#D9DEE7] space-y-1.5 ${rowBg} ${leftBorder}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 bg-[#FFFFFF] border border-[#D9DEE7] rounded-2xs text-[#111827]">
                          {finding.ruleReference}
                        </span>
                        <h4 className="text-xs font-serif font-bold text-[#111827]">
                          {finding.requirement}
                        </h4>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-2xs ${badgeStyle}`}
                      >
                        {label} • {finding.severity}
                      </span>
                    </div>

                    <p className="text-xs text-[#667085] leading-relaxed">
                      {finding.reason}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                      <div className="bg-[#FFFFFF]/90 p-2 border border-[#D9DEE7] rounded-xs">
                        <span className="text-[#667085] block text-[9px] uppercase">Statutory Rule Condition:</span>
                        <span className="text-[#111827]">{finding.expectedCondition}</span>
                      </div>
                      <div className="bg-[#FFFFFF]/90 p-2 border border-[#D9DEE7] rounded-xs">
                        <span className="text-[#667085] block text-[9px] uppercase">Detected Condition:</span>
                        <span className="text-[#111827]">{finding.detectedCondition}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section 5: Photographic Evidence Archive */}
        {report.evidenceImages && report.evidenceImages.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-[#667085] pb-2 border-b border-[#D9DEE7]">
              05 / PHOTOGRAPHIC EVIDENCE ARCHIVE
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.evidenceImages.map((img) => (
                <div
                  key={img.id}
                  className="bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs p-3 space-y-2 group"
                >
                  <div
                    onClick={() => setZoomImage(img)}
                    className="relative aspect-4/3 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs overflow-hidden flex items-center justify-center cursor-zoom-in group-hover:border-[#071B3A] transition-colors"
                  >
                    <img
                      src={img.previewUrl}
                      alt={img.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-[#071B3A]/0 group-hover:bg-[#071B3A]/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="px-2.5 py-1 bg-[#FFFFFF] text-[#111827] text-[10px] font-mono font-bold rounded-xs shadow-md flex items-center gap-1">
                        <ZoomIn className="w-3 h-3" />
                        <span>Enlarge Evidence</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-[#111827] truncate">
                      {img.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#667085]">
                      {img.relatedRequirement || 'Package surface view'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 6: Inspector Observations & Field Notes */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#D9DEE7]">
            <h3 className="text-xs font-mono font-bold uppercase text-[#667085]">
              06 / INSPECTOR OBSERVATIONS & FIELD NOTES
            </h3>
            {!isEditingNotes && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-xs font-mono text-[#111827] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Notes</span>
              </button>
            )}
          </div>

          {isEditingNotes ? (
            <div className="space-y-3">
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Enter official auditor observations, enforcement directives, or packaging notes..."
                rows={4}
                className="w-full p-3 bg-[#FFFFFF] border border-[#071B3A] text-xs text-[#111827] rounded-xs font-mono outline-hidden"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => {
                    setNotesText(report.observations || '');
                    setIsEditingNotes(false);
                  }}
                  className="px-3 py-1.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-1.5 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Save Notes
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs text-xs text-[#111827] font-mono whitespace-pre-wrap">
              {report.observations ? (
                report.observations
              ) : (
                <span className="text-[#667085] italic">
                  No additional field notes entered during this inspection audit.
                </span>
              )}
            </div>
          )}
        </section>

        {/* Section 7: Official Seal & Verification Attestation */}
        <section className="pt-6 border-t border-[#D9DEE7] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] font-mono text-[#667085]">
          <div className="space-y-0.5">
            <div className="text-xs font-serif font-bold text-[#111827]">
              Directorate of Legal Metrology Verification
            </div>
            <div>Department of Consumer Affairs • Packaged Commodities Division</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="text-[#C62828] hover:text-[#C62828]/80 text-xs font-mono underline cursor-pointer"
            >
              Delete Record
            </button>
          </div>
        </section>
      </div>

      {/* Zoom Evidence Modal */}
      <AnimatePresence>
        {zoomImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomImage(null)}
              className="fixed inset-0 bg-[#071B3A]/80 backdrop-blur-2xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#FFFFFF] border border-[#D9DEE7] max-w-4xl w-full p-3 sm:p-5 rounded-xs shadow-2xl z-10 flex flex-col max-h-[94vh] sm:max-h-[90vh]"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-[#D9DEE7] mb-2.5">
                <div className="text-xs font-serif font-bold text-[#111827] truncate pr-2">
                  {zoomImage.name} • {zoomImage.relatedRequirement || 'Package Evidence'}
                </div>
                <button
                  onClick={() => setZoomImage(null)}
                  className="p-1.5 text-[#667085] hover:text-[#111827] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 min-h-0 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs flex items-center justify-center p-2 overflow-auto">
                <img
                  src={zoomImage.previewUrl}
                  alt={zoomImage.name}
                  referrerPolicy="no-referrer"
                  className="max-h-[68vh] sm:max-h-[75vh] max-w-full object-contain"
                />
              </div>

              <div className="pt-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs text-[#667085]">
                <span className="truncate">{zoomImage.description || 'Statutory packaging inspection surface view.'}</span>
                <button
                  onClick={() => setZoomImage(null)}
                  className="w-full sm:w-auto px-4 py-2 sm:py-1.5 bg-[#071B3A] text-[#FFFFFF] text-xs font-semibold rounded-xs text-center cursor-pointer"
                >
                  Close Viewer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Record Modal */}
      <AnimatePresence>
        {deleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmOpen(false)}
              className="fixed inset-0 bg-[#071B3A]/70 backdrop-blur-2xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs p-6 max-w-md w-full shadow-2xl space-y-4 z-10 text-[#111827]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xs bg-[#C62828]/10 text-[#C62828] flex items-center justify-center border border-[#C62828]/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#111827]">
                    Delete Inspection Record?
                  </h3>
                  <p className="text-xs text-[#667085] font-mono">
                    Ref: {report.referenceNumber || report.id}
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#667085] leading-relaxed">
                This will permanently delete this inspection record and evidence. You will be redirected to the inspection history list.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D9DEE7]">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-3.5 py-1.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteInspection(report.id);
                    onBack();
                  }}
                  className="px-4 py-1.5 bg-[#C62828] hover:bg-[#B71C1C] text-[#FFFFFF] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
