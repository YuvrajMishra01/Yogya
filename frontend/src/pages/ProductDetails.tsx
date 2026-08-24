/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Plus,
  Calendar,
  ZoomIn,
  X,
} from 'lucide-react';
import { ProductSummary } from '../types';

interface ProductDetailsProps {
  product: ProductSummary;
  onBack: () => void;
  onSelectInspection: (id: string) => void;
  onSelectReport: (id: string) => void;
  navigate: (path: string) => void;
}

export function ProductDetails({
  product,
  onBack,
  onSelectInspection,
  onSelectReport,
  navigate,
}: ProductDetailsProps) {
  const [zoomImage, setZoomImage] = useState<{ id: string; previewUrl: string; name: string; relatedRequirement?: string; description: string } | null>(null);

  // Cumulative evidence images from all inspections of this product
  const cumulativeEvidence = useMemo(() => {
    const images: Array<{ id: string; previewUrl: string; name: string; relatedRequirement?: string; description: string; inspectionRef: string }> = [];
    const seenUrls = new Set<string>();

    product.inspections.forEach((insp) => {
      (insp.evidenceImages || []).forEach((img) => {
        if (!seenUrls.has(img.previewUrl)) {
          seenUrls.add(img.previewUrl);
          images.push({
            ...img,
            inspectionRef: insp.referenceNumber || insp.id,
          });
        }
      });
    });

    return images;
  }, [product]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Action Bar */}
      <div className="pb-4 border-b border-[#D9DEE7] flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Product Catalog</span>
        </button>

        <button
          onClick={() => navigate('/inspection')}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Inspection for this Commodity</span>
        </button>
      </div>

      {/* Main Product Master Card */}
      <div className="bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs p-6 sm:p-8 shadow-2xs space-y-8">
        
        {/* Dossier Header */}
        <div className="border-b border-[#D9DEE7] pb-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#E8F0FC] border border-[#D9DEE7] rounded-xs text-[10px] font-mono uppercase text-[#667085]">
              <span>COMMODITY COMPLIANCE PROFILE</span>
              <span>•</span>
              <span className="text-[#111827] font-bold">{product.stats.totalInspections} Verified {product.stats.totalInspections === 1 ? 'Audit' : 'Audits'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#111827]">
              {product.name}
            </h1>

            <p className="text-xs text-[#667085] font-mono">
              {product.manufacturer || 'Manufacturer Not Declared'}
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-2 shrink-0">
            <div
              className={`px-4 py-2 rounded-xs border text-center ${
                product.latestStatus === 'COMPLIANT'
                  ? 'bg-[#EAF5EF] text-[#287A52] border-[#287A52]'
                  : product.latestStatus === 'NON-COMPLIANT'
                  ? 'bg-[#FDF2F2] text-[#C62828] border-[#C62828]'
                  : 'bg-[#FEF8EC] text-[#B7791F] border-[#B7791F]'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                LATEST DETERMINATION
              </div>
              <div className="text-base font-serif font-bold tracking-tight">
                {product.latestStatus}
              </div>
            </div>

            <div className="text-[11px] font-mono text-[#667085]">
              Latest Audit: {product.latestInspectionDate}
            </div>
          </div>
        </div>

        {/* Section 1: Standard Declared Specifications */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase text-[#667085] pb-2 border-b border-[#D9DEE7]">
            01 / REGISTERED COMMODITY SPECIFICATIONS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#667085]">Product Name</span>
              <p className="font-semibold text-[#111827]">{product.name}</p>
            </div>

            <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#667085]">Manufacturer / Packer</span>
              <p className="font-semibold text-[#111827]">{product.manufacturer || 'N/A'}</p>
            </div>

            <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#667085]">Declared Net Quantity</span>
              <p className="font-semibold text-[#111827]">{product.netQuantity || 'N/A'}</p>
            </div>

            <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#667085]">Maximum Retail Price (MRP)</span>
              <p className="font-semibold text-[#111827]">{product.mrp || 'N/A'}</p>
            </div>

            <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#667085]">Country of Origin</span>
              <p className="font-semibold text-[#111827]">{product.countryOfOrigin || 'N/A'}</p>
            </div>

            <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#667085]">Total Audits Recorded</span>
              <p className="font-semibold text-[#111827]">{product.stats.totalInspections}</p>
            </div>

            <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-1 sm:col-span-2">
              <span className="text-[10px] font-mono uppercase text-[#667085]">Registered Office Address</span>
              <p className="font-semibold text-[#111827]">{product.address || 'N/A'}</p>
            </div>

            <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#667085]">Consumer Helpline / Contact</span>
              <p className="font-semibold text-[#111827]">{product.consumerCare || 'N/A'}</p>
            </div>
          </div>
        </section>

        {/* Section 2: Statutory Compliance Performance & Track Record */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase text-[#667085] pb-2 border-b border-[#D9DEE7]">
            02 / CUMULATIVE STATUTORY AUDIT SCORECARD
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs flex items-center justify-between">
              <div className="text-xs font-mono font-bold text-[#111827]">Total Audits</div>
              <span className="text-xl font-serif font-bold text-[#111827]">
                {product.stats.totalInspections}
              </span>
            </div>

            <div className="p-4 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs flex items-center justify-between">
              <div className="text-xs font-mono font-bold text-[#287A52]">Passes</div>
              <span className="text-xl font-serif font-bold text-[#287A52]">
                {product.stats.passed}
              </span>
            </div>

            <div className="p-4 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs flex items-center justify-between">
              <div className="text-xs font-mono font-bold text-[#B7791F]">Needs Review</div>
              <span className="text-xl font-serif font-bold text-[#B7791F]">
                {product.stats.needsReview}
              </span>
            </div>

            <div className="p-4 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs flex items-center justify-between">
              <div className="text-xs font-mono font-bold text-[#C62828]">Violations</div>
              <span className="text-xl font-serif font-bold text-[#C62828]">
                {product.stats.failed}
              </span>
            </div>
          </div>
        </section>

        {/* Section 3: Chronological Inspection Timeline */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase text-[#667085] pb-2 border-b border-[#D9DEE7]">
            03 / CHRONOLOGICAL INSPECTION TIMELINE
          </h3>

          <div className="border border-[#D9DEE7] rounded-xs overflow-hidden divide-y divide-[#D9DEE7]">
            {product.inspections.map((insp) => (
              <div
                key={insp.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAFAFC]/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#111827]">
                      {insp.referenceNumber || insp.id}
                    </span>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold uppercase rounded-xs border ${
                        insp.overallStatus === 'COMPLIANT'
                          ? 'bg-[#EAF5EF] text-[#287A52] border-[#287A52]'
                          : insp.overallStatus === 'NON-COMPLIANT'
                          ? 'bg-[#FDF2F2] text-[#C62828] border-[#C62828]'
                          : 'bg-[#FEF8EC] text-[#B7791F] border-[#B7791F]'
                      }`}
                    >
                      {insp.overallStatus}
                    </span>

                    <span className="text-[11px] font-mono text-[#667085] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{insp.inspectionDate}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#667085]">
                    <span>Score: {insp.stats?.passed ?? 0} Passed / {insp.stats?.needsReview ?? 0} Review / {insp.stats?.failed ?? 0} Failed</span>
                    {insp.observations && (
                      <span>• Notes: <span className="text-[#111827] italic truncate max-w-xs">{insp.observations}</span></span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D9DEE7]/60 shrink-0">
                  <button
                    onClick={() => onSelectInspection(insp.id)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 sm:py-1.5 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    View Record
                  </button>

                  <button
                    onClick={() => onSelectReport(insp.id)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 sm:py-1.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
                  >
                    Formal Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Cumulative Packaging Evidence Archive */}
        {cumulativeEvidence.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-[#667085] pb-2 border-b border-[#D9DEE7]">
              04 / CUMULATIVE PACKAGING EVIDENCE ARCHIVE ({cumulativeEvidence.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cumulativeEvidence.map((img) => (
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
                        <span>Enlarge Photo</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-[#111827] truncate">
                      {img.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#667085]">
                      Ref: {img.inspectionRef} • {img.relatedRequirement || 'Package surface'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
    </div>
  );
}
