/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ScanLine,
  FileText,
  Search,
  FileDown,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  Share2,
  Printer,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';
import { InspectionReport } from '../types';
import { api, OCRJobStatusResponse, OCRResultsResponse } from '../lib/api';
import { exportReportAsHtml } from '../lib/compliance';
import { YogyaLogo, YogyaIcon } from '../components/common/YogyaLogo';

interface ReportProps {
  reports: InspectionReport[];
  selectedReportId: string | null;
  onSelectReport: (id: string | null) => void;
  onDeleteReport: (id: string) => void;
  onUpdateObservation: (id: string, observations: string) => void;
  navigate: (path: string) => void;
}

export function Report({
  reports,
  selectedReportId,
  onSelectReport,
  onDeleteReport,
  onUpdateObservation,
  navigate,
}: ReportProps) {
  const selectedReport = reports.find((r) => r.id === selectedReportId);

  if (selectedReportId && selectedReport) {
    return (
      <ReportDetailView
        report={selectedReport}
        onBack={() => onSelectReport(null)}
        onUpdateObservation={(obs) => onUpdateObservation(selectedReportId, obs)}
        onDeleteReport={onDeleteReport}
        navigate={navigate}
      />
    );
  }

  return (
    <ReportsView
      reports={reports}
      onSelectReport={onSelectReport}
      onDeleteReport={onDeleteReport}
      navigate={navigate}
    />
  );
}

function ReportsView({
  reports,
  onSelectReport,
  onDeleteReport,
  navigate,
}: {
  reports: InspectionReport[];
  onSelectReport: (id: string) => void;
  onDeleteReport: (id: string) => void;
  navigate: (path: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLIANT' | 'NON-COMPLIANT' | 'NEEDS REVIEW'>('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered reports list
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || report.overallStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="pb-4 border-b border-[#D9DEE7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#111827]">
            Inspection reports
          </h2>
          <p className="text-xs sm:text-sm text-[#667085]">
            Official compliance certificates and statutory audit documentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/inspection')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>New Inspection</span>
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        /* Empty State */
        <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-8 sm:p-14 rounded-xs text-center max-w-xl mx-auto shadow-2xs space-y-4">
          <div className="w-12 h-12 bg-[#E8F0FC] border border-[#D9DEE7] rounded-xs flex items-center justify-center mx-auto text-[#111827]">
            <FileText className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-serif font-bold text-[#111827]">
            No inspection reports generated yet.
          </h3>

          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
            Perform an inspection workflow in the Inspector Workspace to analyze packaged commodities against Legal Metrology Rules and generate formal compliance reports.
          </p>

          <div className="pt-2">
            <button
              onClick={() => navigate('/inspection')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer"
            >
              <ScanLine className="w-4 h-4" />
              <span>Start First Inspection</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Reports List */
        <div className="space-y-4">
          {/* Controls: Search and Filter */}
          <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-4 rounded-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Report ID, Product name, or Manufacturer..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs text-xs font-sans text-[#111827] focus:bg-[#FFFFFF] focus:border-[#071B3A] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[10px] font-mono uppercase text-[#667085] shrink-0">Filter:</span>
              {(['ALL', 'COMPLIANT', 'NON-COMPLIANT', 'NEEDS REVIEW'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase rounded-xs transition-colors cursor-pointer shrink-0 border ${
                    statusFilter === status
                      ? 'bg-[#071B3A] text-[#FFFFFF] border-[#071B3A] font-bold'
                      : 'bg-[#FFFFFF] text-[#667085] border-[#D9DEE7] hover:bg-[#FAFAFC]'
                  }`}
                >
                  {status === 'ALL' ? 'All' : status === 'COMPLIANT' ? 'Compliant' : status === 'NON-COMPLIANT' ? 'Deficiencies' : 'Review'}
                </button>
              ))}
            </div>
          </div>

          {/* Reports Table / Card View */}
          <div className="bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs shadow-2xs overflow-hidden">
            <div className="px-5 py-3 border-b border-[#D9DEE7] bg-[#FAFAFC] flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-[#667085]">
                ARCHIVED REPORTS ({filteredReports.length})
              </span>
              <span className="text-[10px] font-mono text-[#667085]">
                LEGAL METROLOGY JURISDICTION
              </span>
            </div>

            {filteredReports.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#667085]">
                No reports match the active filter criteria.
              </div>
            ) : (
              <div className="divide-y divide-[#D9DEE7]">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 sm:p-5 hover:bg-[#FAFAFC]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#111827] bg-[#E8F0FC] px-2 py-0.5 rounded-xs border border-[#D9DEE7]">
                          {report.referenceNumber || report.id}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider ${
                            report.overallStatus === 'COMPLIANT'
                              ? 'bg-[#EAF5EF] text-[#287A52] border border-[#287A52]'
                              : report.overallStatus === 'NON-COMPLIANT'
                              ? 'bg-[#FDF2F2] text-[#C62828] border border-[#C62828]'
                              : 'bg-[#FEF8EC] text-[#B7791F] border border-[#B7791F]'
                          }`}
                        >
                          {report.overallStatus === 'COMPLIANT' ? 'Compliant' : report.overallStatus === 'NON-COMPLIANT' ? 'Non-Compliant' : 'Review Required'}
                        </span>
                        <span className="text-[11px] font-mono text-[#667085]">
                          {report.inspectionDate}
                        </span>
                      </div>

                      <h4 className="text-base font-serif font-bold text-[#111827]">
                        {report.productName || 'Product Identity Not Declared'}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#667085] font-mono">
                        <span>
                          <strong className="font-semibold text-[#111827]">Manufacturer:</strong> {report.manufacturer || 'Not detected'}
                        </span>
                        <span>•</span>
                        <span>
                          <strong className="font-semibold text-[#111827]">MRP:</strong> {report.mrp || 'Not detected'}
                        </span>
                        <span>•</span>
                        <span>
                          <strong className="font-semibold text-[#111827]">Net Qty:</strong> {report.netQuantity || 'Not detected'}
                        </span>
                        <span>•</span>
                        <span>
                          <strong className="font-semibold text-[#111827]">Evidence:</strong> {report.evidenceImages.length} {report.evidenceImages.length === 1 ? 'image' : 'images'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#D9DEE7]/60 shrink-0">
                      <button
                        onClick={() => onSelectReport(report.id)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Document</span>
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
                        title="Delete Report"
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
                    Delete Inspection Report?
                  </h3>
                  <p className="text-xs text-[#667085] font-mono">
                    Ref: {deleteConfirmId}
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#667085] leading-relaxed">
                This will permanently delete this official compliance report and associated verification evidence from local records.
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
                    onDeleteReport(deleteConfirmId);
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

function ReportDetailView({
  report,
  onBack,
  onUpdateObservation,
  onDeleteReport,
  navigate,
}: {
  report: InspectionReport;
  onBack: () => void;
  onUpdateObservation: (observations: string) => void;
  onDeleteReport: (id: string) => void;
  navigate: (path: string) => void;
}) {
  const [isEditingObservations, setIsEditingObservations] = useState(false);
  const [editedObservations, setEditedObservations] = useState(report.observations || '');
  const [zoomImage, setZoomImage] = useState<{ id: string; previewUrl: string; name: string; relatedRequirement?: string; description: string } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrStatusText, setOcrStatusText] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrJobStatus, setOcrJobStatus] = useState<OCRJobStatusResponse | null>(null);
  const [ocrResults, setOcrResults] = useState<OCRResultsResponse | null>(null);
  const [isPollingOCR, setIsPollingOCR] = useState(false);

  const fetchOCRInfo = async (): Promise<boolean> => {
    try {
      const statusRes = await api.getOCRStatus(report.id);
      setOcrJobStatus(statusRes);
      if (statusRes.status === 'completed') {
        const resultsRes = await api.getOCRResults(report.id);
        setOcrResults(resultsRes);
        setOcrStatusText(null);
        return false;
      } else if (statusRes.status === 'failed') {
        setOcrError(statusRes.error_message || 'OCR processing failed');
        setOcrStatusText(null);
        return false;
      }
      setOcrStatusText(`OCR ${statusRes.status}...`);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchOCRInfo().then((shouldPoll) => {
      if (isMounted && shouldPoll) {
        setIsPollingOCR(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [report.id]);

  useEffect(() => {
    if (!isPollingOCR) return;
    const interval = setInterval(async () => {
      const shouldContinue = await fetchOCRInfo();
      if (!shouldContinue) {
        setIsPollingOCR(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPollingOCR, report.id]);

  const handleStartOCR = async () => {
    if (ocrLoading || isPollingOCR) return;
    setOcrLoading(true);
    setOcrError(null);
    setOcrStatusText('Processing...');
    try {
      const res = await api.processOCR(report.id);
      setOcrJobStatus(res);
      setOcrStatusText(`OCR job started (${res.status})`);
      setIsPollingOCR(true);
    } catch (err: any) {
      setOcrError(err?.message || 'Failed to start OCR job');
      setOcrStatusText(null);
    } finally {
      setOcrLoading(false);
    }
  };

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

  const handleSaveObservations = () => {
    onUpdateObservation(editedObservations);
    setIsEditingObservations(false);
  };

  const handleCopyReportSummary = () => {
    const text = `YOGYA INSPECTION REPORT: ${report.referenceNumber || report.id}
Product: ${report.productName || 'N/A'}
Status: ${report.overallStatus}
Date: ${report.inspectionDate}
Manufacturer: ${report.manufacturer || 'N/A'}
MRP: ${report.mrp || 'N/A'}
Net Qty: ${report.netQuantity || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ─── ACTION BAR (Screen Only - Hidden in Print) ─── */}
      <div className="no-print bg-[#FFFFFF] border border-[#D9DEE7] p-4 rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Reports</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {ocrStatusText && (
            <span className="text-xs font-mono text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1.5 rounded-xs border border-[#A5D6A7]">
              {ocrStatusText}
            </span>
          )}
          {ocrError && (
            <span className="text-xs font-mono text-[#C62828] bg-[#FFEBEE] px-2.5 py-1.5 rounded-xs border border-[#EF9A9A]">
              {ocrError}
            </span>
          )}

          <button
            type="button"
            onClick={handleStartOCR}
            disabled={ocrLoading || isPollingOCR}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] disabled:opacity-50 text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
          >
            <ScanLine className="w-3.5 h-3.5 text-[#071B3A]" />
            <span>{ocrLoading || isPollingOCR ? 'Processing...' : 'Start OCR'}</span>
          </button>

          <button
            onClick={handleCopyReportSummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-mono text-[#111827] rounded-xs transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copySuccess ? 'Copied Summary' : 'Share'}</span>
          </button>

          <button
            onClick={() => exportReportAsHtml(report)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-mono text-[#111827] rounded-xs transition-colors cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-[#667085]" />
            <span>Export HTML</span>
          </button>

          <button
            type="button"
            id="print-pdf-report-btn"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF Document</span>
          </button>
        </div>
      </div>

      {/* ─── OCR STATUS & RESULTS SECTION (Screen Only) ─── */}
      {ocrJobStatus && (
        <div className="no-print bg-[#FFFFFF] border border-[#D9DEE7] p-4 rounded-xs shadow-2xs max-w-4xl mx-auto space-y-3 text-[#111827]">
          <div className="flex items-center justify-between border-b border-[#D9DEE7] pb-2">
            <div className="flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-[#071B3A]" />
              <span className="text-xs font-serif font-bold uppercase tracking-wider">OCR Pipeline Status</span>
            </div>
            <span className={`text-[11px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-xs border ${
              ocrJobStatus.status === 'completed' ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]' :
              ocrJobStatus.status === 'failed' ? 'bg-[#FFEBEE] text-[#C62828] border-[#EF9A9A]' :
              'bg-[#E8F0FC] text-[#071B3A] border-[#93C5FD]'
            }`}>
              {ocrJobStatus.status} {isPollingOCR ? '• Polling...' : ''}
            </span>
          </div>

          {ocrJobStatus.status === 'completed' && ocrResults && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xs">
                  <span className="text-[10px] text-[#667085] block">Avg Confidence</span>
                  <span className="font-bold text-[#111827]">{ocrResults.average_confidence}%</span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xs">
                  <span className="text-[10px] text-[#667085] block">Processing Time</span>
                  <span className="font-bold text-[#111827]">{ocrResults.processing_time_ms} ms</span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xs">
                  <span className="text-[10px] text-[#667085] block">Detected Regions</span>
                  <span className="font-bold text-[#111827]">{ocrResults.regions.length} regions</span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xs">
                  <span className="text-[10px] text-[#667085] block">Engine</span>
                  <span className="font-bold text-[#111827]">{ocrJobStatus.engine_used}</span>
                </div>
              </div>

              {ocrResults.raw_text && (
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xs">
                  <span className="text-[10px] text-[#667085] block font-sans font-medium uppercase mb-1">Extracted Raw OCR Text</span>
                  <p className="text-xs font-mono text-[#1E293B] whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed">
                    {ocrResults.raw_text}
                  </p>
                </div>
              )}
            </div>
          )}

          {ocrJobStatus.status === 'failed' && ocrJobStatus.error_message && (
            <p className="text-xs font-mono text-[#C62828] bg-[#FFEBEE] p-2.5 rounded-xs border border-[#EF9A9A]">
              Error: {ocrJobStatus.error_message}
            </p>
          )}
        </div>
      )}

      {/* ─── FORMAL STATUTORY REPORT DOCUMENT ─── */}
      <div className="report-print-container bg-[#FFFFFF] border border-[#D9DEE7] p-6 sm:p-12 rounded-xs shadow-md max-w-4xl mx-auto text-[#111827] space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* Document Header */}
        <div className="border-b-2 border-[#071A33] pb-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xs bg-[#071A33] text-[#FFFFFF] flex items-center justify-center border border-[#0D2A55] shrink-0 print:border-black">
                <YogyaIcon size={26} theme="dark" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight leading-tight">
                  YOGYA DIGITAL INSPECTION REPORT
                </h1>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#667085]">
                  DIRECTORATE OF LEGAL METROLOGY • STATUTORY COMPLIANCE RECORD
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs">
              <div className="font-bold text-[#111827]">REF: {report.referenceNumber || report.id}</div>
              <div className="text-[#667085] text-[11px] mt-0.5">
                {report.inspectionDate}
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#667085] border-t border-[#D9DEE7]">
            <span>STATUTORY JURISDICTION: THE LEGAL METROLOGY ACT, 2009</span>
            <span>RULES APPLIED: PACKAGED COMMODITIES RULES, 2011</span>
          </div>
        </div>

        {/* 1. Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs text-xs font-mono">
          <div>
            <div className="text-[10px] text-[#667085] uppercase font-semibold">RECORD STATUS</div>
            <div className="font-bold text-[#111827] mt-0.5">{report.status}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#667085] uppercase font-semibold">INSPECTION REF</div>
            <div className="font-bold text-[#111827] mt-0.5">{report.referenceNumber || report.id}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#667085] uppercase font-semibold">INSPECTION DATE</div>
            <div className="font-bold text-[#111827] mt-0.5">{report.inspectionDate}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#667085] uppercase font-semibold">EVIDENCE ATTACHED</div>
            <div className="font-bold text-[#111827] mt-0.5">{report.evidenceImages.length} Verified Photos</div>
          </div>
        </div>

        {/* 2. Product Profile Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-[#071B3A]">
            <span className="text-xs font-mono font-bold uppercase text-[#111827]">SECTION I</span>
            <span className="text-xs text-[#D9DEE7]">/</span>
            <h2 className="text-sm font-serif font-bold text-[#111827]">COMMODITY PROFILE & REGISTERED DECLARATIONS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3 p-4 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs">
              <div>
                <span className="text-[10px] font-mono text-[#667085] uppercase block">Generic / Product Name</span>
                <span className="font-serif font-bold text-sm text-[#111827] mt-0.5 block">
                  {report.productName || 'Not declared on package'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#667085] uppercase block">Manufacturer / Packer / Importer</span>
                <span className="text-xs text-[#111827] mt-0.5 block font-mono">
                  {report.manufacturer || 'Not declared on package'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#667085] uppercase block">Registered Address</span>
                <span className="text-xs text-[#111827] mt-0.5 block font-mono">
                  {report.address || 'Not declared on package'}
                </span>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-mono text-[#667085] uppercase block">Declared Net Quantity</span>
                  <span className="text-xs font-bold font-mono text-[#111827] mt-0.5 block">
                    {report.netQuantity || 'Not declared'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#667085] uppercase block">Maximum Retail Price</span>
                  <span className="text-xs font-bold font-mono text-[#111827] mt-0.5 block">
                    {report.mrp || 'Not declared'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-mono text-[#667085] uppercase block">Date Information (Mfg / Pkg)</span>
                  <span className="text-xs text-[#111827] mt-0.5 block font-mono">
                    {report.dateInfo || 'Not declared'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#667085] uppercase block">Country of Origin</span>
                  <span className="text-xs text-[#111827] mt-0.5 block font-mono">
                    {report.countryOfOrigin || 'Not declared'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#667085] uppercase block">Consumer Care / Grievance Cell</span>
                <span className="text-xs text-[#111827] mt-0.5 block font-mono">
                  {report.consumerCare || 'Not declared'}
                </span>
              </div>
            </div>
          </div>

          {/* Extracted Legal Metrology Declarations Table (Read-Only) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#071B3A]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-[#111827]">EXTRACTED LEGAL METROLOGY DECLARATIONS</span>
                <span className="text-xs text-[#667085] font-mono">({report.declarations?.length || 0} fields)</span>
              </div>
              <span className="text-[10px] font-mono text-[#667085] uppercase">Read-Only View</span>
            </div>

            {!report.declarations || report.declarations.length === 0 ? (
              <div className="p-4 bg-[#F8FAFC] border border-[#D9DEE7] rounded-xs text-center text-xs font-mono text-[#667085]">
                No declarations detected yet. Run OCR to extract legal metrology declarations.
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#D9DEE7] rounded-xs">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#FAFAFC] border-b border-[#D9DEE7] text-[10px] uppercase text-[#667085]">
                    <tr>
                      <th className="p-2.5">Category / Label</th>
                      <th className="p-2.5">Current Value</th>
                      <th className="p-2.5">Extracted Value</th>
                      <th className="p-2.5">Confidence</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right">Evidence Index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9DEE7] bg-[#FFFFFF] text-[#111827]">
                    {report.declarations.map((decl) => (
                      <tr key={decl.id || decl.category} className="hover:bg-[#F8FAFC]">
                        <td className="p-2.5 font-medium">
                          <div>{decl.label}</div>
                          <div className="text-[10px] text-[#667085] font-normal">{decl.statutoryRuleRef || decl.category}</div>
                        </td>
                        <td className="p-2.5 font-bold text-[#111827]">{decl.currentValue || '—'}</td>
                        <td className="p-2.5 text-[#667085]">{decl.extractedValue || '—'}</td>
                        <td className="p-2.5">
                          <span className="inline-block text-[10px] px-2 py-0.5 rounded-xs bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
                            {decl.confidence}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase border ${
                            decl.status === 'DETECTED' ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]' :
                            decl.status === 'REVIEW_REQUIRED' ? 'bg-[#FFF8E1] text-[#F57F17] border-[#FFE082]' :
                            'bg-[#FFEBEE] text-[#C62828] border-[#EF9A9A]'
                          }`}>
                            {decl.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-right text-[#667085]">
                          {decl.evidenceImageIndex !== undefined ? `#${decl.evidenceImageIndex}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 3. Overall Compliance Determination Banner */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-[#071B3A]">
            <span className="text-xs font-mono font-bold uppercase text-[#111827]">SECTION II</span>
            <span className="text-xs text-[#D9DEE7]">/</span>
            <h2 className="text-sm font-serif font-bold text-[#111827]">STATUTORY COMPLIANCE DETERMINATION</h2>
          </div>

          <div className="p-5 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9DEE7]">
              <div>
                <span className="text-[10px] font-mono text-[#667085] uppercase block">AUDIT CONCLUSION</span>
                <span
                  className={`inline-flex items-center gap-2 text-base font-serif font-bold mt-1 ${
                    report.overallStatus === 'COMPLIANT'
                      ? 'text-[#287A52]'
                      : report.overallStatus === 'NON-COMPLIANT'
                      ? 'text-[#C62828]'
                      : 'text-[#B7791F]'
                  }`}
                >
                  {report.overallStatus === 'COMPLIANT' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                  {report.overallStatus === 'NON-COMPLIANT' && <AlertTriangle className="w-5 h-5 shrink-0" />}
                  {(report.overallStatus === 'NEEDS REVIEW' || report.overallStatus === 'INCONCLUSIVE') && <Info className="w-5 h-5 shrink-0" />}
                  <span>
                    {report.overallStatus === 'COMPLIANT'
                      ? 'STATUTORILY COMPLIANT COMMODITY'
                      : report.overallStatus === 'NON-COMPLIANT'
                      ? 'STATUTORY NON-COMPLIANCE DEFICIENCIES IDENTIFIED'
                      : 'OFFICIAL INSPECTOR REVIEW REQUIRED'}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="text-center px-3 py-1.5 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs">
                  <div className="text-[10px] text-[#667085] uppercase">PASSED</div>
                  <div className="font-bold text-[#287A52]">{report.stats.passed}</div>
                </div>
                <div className="text-center px-3 py-1.5 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs">
                  <div className="text-[10px] text-[#667085] uppercase">REVIEW</div>
                  <div className="font-bold text-[#B7791F]">{report.stats.needsReview}</div>
                </div>
                <div className="text-center px-3 py-1.5 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs">
                  <div className="text-[10px] text-[#667085] uppercase">FAILED</div>
                  <div className="font-bold text-[#C62828]">{report.stats.failed}</div>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#667085] leading-relaxed">
              {report.overallStatus === 'COMPLIANT'
                ? 'All mandatory packaging declarations required under Rule 6 of the Legal Metrology (Packaged Commodities) Rules, 2011 are verified as present, legible, and compliant with statutory requirements.'
                : report.overallStatus === 'NON-COMPLIANT'
                ? 'One or more mandatory declarations are missing, illegible, or non-compliant with prescribed statutory formats. Appropriate legal notice or rectification may be required.'
                : 'Certain declarations require manual inspector scrutiny or secondary verification against registered manufacturer records.'}
            </p>
          </div>
        </div>

        {/* 4. Detailed Statutory Findings Matrix */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-[#071B3A]">
            <span className="text-xs font-mono font-bold uppercase text-[#111827]">SECTION III</span>
            <span className="text-xs text-[#D9DEE7]">/</span>
            <h2 className="text-sm font-serif font-bold text-[#111827]">COMPLIANCE FINDINGS</h2>
          </div>

          {!report.findings || report.findings.length === 0 ? (
            <div className="p-6 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs text-center text-xs font-mono text-[#667085]">
              No compliance findings available yet. Run OCR to evaluate compliance.
            </div>
          ) : (
            <div className="border border-[#D9DEE7] rounded-xs overflow-hidden">
              {/* Mobile Stacked Card View */}
              <div className="sm:hidden print:hidden divide-y divide-[#D9DEE7]">
                {report.findings.map((f) => {
                  const isPassed = f.status === 'PASSED' || f.status === 'PASS';
                  const isReview = f.status === 'NEEDS_REVIEW' || f.status === 'REVIEW_REQUIRED' || (f.status as string) === 'REVIEW';
                  const rowBg = isPassed ? 'bg-[#F1F8F4]' : isReview ? 'bg-[#FFF9EC]' : 'bg-[#FDF1F1]';
                  const leftBorder = isPassed ? 'border-l-[3.5px] border-l-[#287A52]' : isReview ? 'border-l-[3.5px] border-l-[#B7791F]' : 'border-l-[3.5px] border-l-[#C62828]';
                  const badgeStyle = isPassed ? 'bg-[#EAF6EF] text-[#287A52] border border-[#A5D6A7]' : isReview ? 'bg-[#FFF9EC] text-[#B7791F] border border-[#FFE082]' : 'bg-[#FDF1F1] text-[#C62828] border border-[#EF9A9A]';
                  const label = isPassed ? 'PASS' : isReview ? 'REVIEW_REQUIRED' : 'FAIL';

                  return (
                    <div key={f.id || f.categoryNumber} className={`p-3.5 space-y-2 ${rowBg} ${leftBorder}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs font-mono text-[#111827]">Category {f.categoryNumber}: {f.requirement}</div>
                          <div className="text-[10px] font-mono text-[#667085] mt-0.5">{f.ruleReference}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`inline-block px-2 py-0.5 rounded-xs font-bold uppercase text-[10px] font-mono ${badgeStyle}`}>
                            {label}
                          </span>
                          <span className={`inline-block text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-xs border ${
                            f.severity === 'Critical' ? 'bg-[#FFEBEE] text-[#C62828] border-[#EF9A9A]' :
                            f.severity === 'Major' ? 'bg-[#FFF3E0] text-[#E65100] border-[#FFCC80]' :
                            'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]'
                          }`}>
                            {f.severity}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-[#667085]">
                        <div className="text-[#111827] font-medium">{f.reason}</div>
                        <div className="text-[11px] text-[#667085] mt-0.5">Expected: {f.expectedCondition}</div>
                      </div>

                      <div className="text-xs pt-1">
                        <div className="text-[10px] font-mono text-[#667085] uppercase mb-0.5">Detected Packaging Value:</div>
                        <div className="font-mono text-xs bg-[#FFFFFF]/80 p-2 rounded-xs border border-[#D9DEE7]">
                          {f.detectedCondition && f.detectedCondition !== 'Not detected' ? (
                            <span className="text-[#111827] font-medium break-words">{f.detectedCondition}</span>
                          ) : (
                            <span className="text-[#667085] italic">Not detected</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop / Print Table View */}
              <div className="hidden sm:block print:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAFAFC] border-b border-[#D9DEE7] font-mono text-[10px] uppercase text-[#667085]">
                      <th className="py-2.5 px-3 font-semibold">Category / Rule Reference</th>
                      <th className="py-2.5 px-3 font-semibold">Requirement & Reason</th>
                      <th className="py-2.5 px-3 font-semibold">Detected Packaging Condition</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Severity</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9DEE7]">
                    {report.findings.map((f) => {
                      const isPassed = f.status === 'PASSED' || f.status === 'PASS';
                      const isReview = f.status === 'NEEDS_REVIEW' || f.status === 'REVIEW_REQUIRED' || (f.status as string) === 'REVIEW';
                      const rowBg = isPassed ? 'bg-[#F1F8F4]' : isReview ? 'bg-[#FFF9EC]' : 'bg-[#FDF1F1]';
                      const leftBorder = isPassed ? 'border-l-[3.5px] border-l-[#287A52]' : isReview ? 'border-l-[3.5px] border-l-[#B7791F]' : 'border-l-[3.5px] border-l-[#C62828]';
                      const badgeStyle = isPassed ? 'bg-[#EAF6EF] text-[#287A52] border border-[#A5D6A7]' : isReview ? 'bg-[#FFF9EC] text-[#B7791F] border border-[#FFE082]' : 'bg-[#FDF1F1] text-[#C62828] border border-[#EF9A9A]';
                      const label = isPassed ? 'PASS' : isReview ? 'REVIEW_REQUIRED' : 'FAIL';

                      return (
                        <tr key={f.id || f.categoryNumber} className={`${rowBg} transition-colors`}>
                          <td className={`py-2.5 px-3 align-top font-mono ${leftBorder}`}>
                            <div className="font-bold text-[#111827]">Cat {f.categoryNumber}: {f.requirement}</div>
                            <div className="text-[10px] text-[#667085]">{f.ruleReference}</div>
                          </td>
                          <td className="py-2.5 px-3 align-top text-[#667085]">
                            <div className="text-[#111827] font-medium">{f.reason}</div>
                            <div className="text-[11px] text-[#667085] mt-0.5">Expected: {f.expectedCondition}</div>
                          </td>
                          <td className="py-2.5 px-3 align-top font-mono text-xs max-w-[180px]">
                            {f.detectedCondition && f.detectedCondition !== 'Not detected' ? (
                              <span className="text-[#111827] font-medium break-words">{f.detectedCondition}</span>
                            ) : (
                              <span className="text-[#667085] italic">Not detected</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 align-top text-center font-mono">
                            <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs border ${
                              f.severity === 'Critical' ? 'bg-[#FFEBEE] text-[#C62828] border-[#EF9A9A]' :
                              f.severity === 'Major' ? 'bg-[#FFF3E0] text-[#E65100] border-[#FFCC80]' :
                              'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]'
                            }`}>
                              {f.severity}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 align-top text-center font-mono text-[10px]">
                            <span className={`inline-block px-2 py-0.5 rounded-xs font-bold uppercase ${badgeStyle}`}>
                              {label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 5. Photographic Evidence Gallery */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-[#071B3A]">
            <span className="text-xs font-mono font-bold uppercase text-[#111827]">SECTION IV</span>
            <span className="text-xs text-[#D9DEE7]">/</span>
            <h2 className="text-sm font-serif font-bold text-[#111827]">PHOTOGRAPHIC EVIDENCE ARCHIVE</h2>
          </div>

          {report.evidenceImages.length === 0 ? (
            <div className="p-4 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs text-xs text-[#667085] italic">
              No photographic evidence images attached to this record.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {report.evidenceImages.map((img, idx) => (
                <div
                  key={img.id || idx}
                  onClick={() => setZoomImage(img)}
                  className="group relative bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs overflow-hidden cursor-pointer hover:border-[#071B3A] transition-all"
                >
                  <div className="aspect-square w-full bg-[#E8F0FC] flex items-center justify-center overflow-hidden">
                    <img
                      src={img.previewUrl}
                      alt={img.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 bg-[#FFFFFF] border-t border-[#D9DEE7] text-[10px] font-mono">
                    <div className="font-bold text-[#111827] truncate">{img.relatedRequirement || `Panel ${idx + 1}`}</div>
                    <div className="text-[#667085] truncate">{img.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Inspector Observations & Remarks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-[#071B3A]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-[#111827]">SECTION V</span>
              <span className="text-xs text-[#D9DEE7]">/</span>
              <h2 className="text-sm font-serif font-bold text-[#111827]">INSPECTOR OBSERVATIONS & FIELD NOTES</h2>
            </div>
            {!isEditingObservations && (
              <button
                onClick={() => setIsEditingObservations(true)}
                className="no-print text-xs font-mono text-[#667085] hover:text-[#111827] underline cursor-pointer"
              >
                Edit remarks
              </button>
            )}
          </div>

          {isEditingObservations ? (
            <div className="no-print space-y-2 p-4 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
              <textarea
                rows={3}
                value={editedObservations}
                onChange={(e) => setEditedObservations(e.target.value)}
                placeholder="Enter official observations or recommendations..."
                className="w-full p-2.5 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs text-xs font-sans text-[#111827] focus:outline-none focus:border-[#071B3A]"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsEditingObservations(false)}
                  className="px-3 py-1 text-xs border border-[#D9DEE7] bg-[#FFFFFF] text-[#667085] hover:text-[#111827] rounded-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveObservations}
                  className="px-4 py-1 text-xs bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] font-semibold rounded-xs"
                >
                  Save Remarks
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs text-xs font-sans leading-relaxed text-[#111827]">
              {report.observations ? (
                <p className="whitespace-pre-wrap">{report.observations}</p>
              ) : (
                <span className="text-[#667085] italic font-mono text-[11px]">
                  No additional inspector remarks recorded for this commodity.
                </span>
              )}
            </div>
          )}
        </div>

        {/* 7. Attestation & Digital Stamp */}
        <div className="pt-6 border-t-2 border-[#071A33] space-y-6">
          <div className="p-4 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs text-[11px] text-[#667085] leading-relaxed">
            <p className="font-semibold text-[#111827] mb-1">OFFICIAL STATUTORY ATTESTATION:</p>
            This inspection report is an official electronic record produced by the Yogya Compliance Platform in accordance with the provisions of the Legal Metrology Act, 2009 and the Legal Metrology (Packaged Commodities) Rules, 2011. The findings and photographic evidence recorded herein reflect the verified physical attributes of the inspected packaged commodity at the time of examination.
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-2 font-mono text-xs">
            <div className="space-y-1">
              <div className="text-[10px] text-[#667085] uppercase font-semibold">DIGITAL SIGN-OFF ATTESTATION</div>
              <div className="font-bold text-[#111827]">VERIFIED AUDIT STATUS: {report.status.toUpperCase()}</div>
              <div className="text-[#667085] text-[11px]">RECORD CREATION: {report.inspectionDate}</div>
            </div>

            {/* Visual Institutional Stamp */}
            <div className="p-3 border-2 border-[#071A33] rounded-xs bg-[#FFFFFF] text-center space-y-0.5 text-[#111827] shadow-2xs">
              <div className="text-[9px] font-mono uppercase tracking-widest text-[#667085]">DIRECTORATE OF LEGAL METROLOGY</div>
              <div className="font-bold text-xs tracking-wider">OFFICIALLY AUDITED</div>
              <div className="text-[9px] font-mono text-[#667085]">YOGYA • SYSTEM EDITION 2026</div>
            </div>
          </div>
        </div>

      </div>

      {/* Evidence Zoom Modal */}
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
              className="relative bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs p-3 sm:p-5 max-w-4xl w-full shadow-2xl z-10 flex flex-col max-h-[94vh] sm:max-h-[90vh] text-[#111827]"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-[#D9DEE7] mb-2.5">
                <div className="pr-2 truncate">
                  <h4 className="text-xs sm:text-sm font-serif font-bold text-[#111827] truncate">{zoomImage.relatedRequirement || 'Photographic Evidence'}</h4>
                  <p className="text-[10px] font-mono text-[#667085] truncate">{zoomImage.name}</p>
                </div>
                <button
                  onClick={() => setZoomImage(null)}
                  className="p-1.5 text-[#667085] hover:text-[#111827] cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center bg-[#FAFAFC] p-2 rounded-xs border border-[#D9DEE7]">
                <img
                  src={zoomImage.previewUrl}
                  alt={zoomImage.name}
                  referrerPolicy="no-referrer"
                  className="max-h-[68vh] sm:max-h-[75vh] max-w-full object-contain"
                />
              </div>

              <div className="pt-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <span className="text-xs text-[#667085] font-mono truncate">{zoomImage.description || 'Statutory packaging inspection surface view.'}</span>
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
    </div>
  );
}
