/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Info,
  ShieldCheck,
  X
} from 'lucide-react';
import { DeclarationField, InspectionImageItem } from '../../types';

interface EvidenceViewerProps {
  images: InspectionImageItem[];
  activeAnalysisImageIndex: number;
  setActiveAnalysisImageIndex: React.Dispatch<React.SetStateAction<number>>;
  imageZoom: number;
  panOffset: { x: number; y: number };
  isPanning: boolean;
  activeEvidenceFieldId: string | null;
  declarations: DeclarationField[];
  onClearActiveEvidenceField: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitScreen: () => void;
  onMouseDownPan: (e: React.MouseEvent) => void;
  onMouseMovePan: (e: React.MouseEvent) => void;
  onMouseUpPan: () => void;
  onReturnToCapture: () => void;
  imageContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  images,
  activeAnalysisImageIndex,
  setActiveAnalysisImageIndex,
  imageZoom,
  panOffset,
  isPanning,
  activeEvidenceFieldId,
  declarations,
  onClearActiveEvidenceField,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitScreen,
  onMouseDownPan,
  onMouseMovePan,
  onMouseUpPan,
  onReturnToCapture,
  imageContainerRef,
}) => {
  const activeField = declarations.find((d) => d.id === activeEvidenceFieldId);

  return (
    <div className="space-y-4">
      <div className="bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs shadow-2xs overflow-hidden">
        
        {/* Viewer Controls Bar */}
        <div className="p-3 bg-[#E8F0FC] border-b border-[#D9DEE7] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={images.length <= 1 || activeAnalysisImageIndex === 0}
              onClick={() => setActiveAnalysisImageIndex((prev) => Math.max(0, prev - 1))}
              className="p-1.5 bg-[#FFFFFF] border border-[#D9DEE7] rounded-2xs text-[#111827] hover:bg-[#FAFAFC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Image"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <div className="px-2 py-1 bg-[#FFFFFF] border border-[#D9DEE7] rounded-2xs font-mono text-[11px] font-bold text-[#111827]">
              IMAGE {images.length > 0 ? activeAnalysisImageIndex + 1 : 0} / {images.length}
            </div>

            <button
              type="button"
              disabled={images.length <= 1 || activeAnalysisImageIndex >= images.length - 1}
              onClick={() => setActiveAnalysisImageIndex((prev) => Math.min(images.length - 1, prev + 1))}
              className="p-1.5 bg-[#FFFFFF] border border-[#D9DEE7] rounded-2xs text-[#111827] hover:bg-[#FAFAFC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next Image"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onZoomOut}
              className="p-1.5 bg-[#FFFFFF] border border-[#D9DEE7] rounded-2xs text-[#111827] hover:bg-[#FAFAFC] cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="px-2 py-1 bg-[#FFFFFF] border border-[#D9DEE7] rounded-2xs font-mono text-[11px] text-[#667085]">
              {Math.round(imageZoom * 100)}%
            </span>

            <button
              type="button"
              onClick={onZoomIn}
              className="p-1.5 bg-[#FFFFFF] border border-[#D9DEE7] rounded-2xs text-[#111827] hover:bg-[#FAFAFC] cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onResetZoom}
              className="p-1.5 bg-[#FFFFFF] border border-[#D9DEE7] rounded-2xs text-[#111827] hover:bg-[#FAFAFC] cursor-pointer"
              title="Reset Zoom (100%)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onFitScreen}
              className="p-1.5 bg-[#FFFFFF] border border-[#D9DEE7] rounded-2xs text-[#111827] hover:bg-[#FAFAFC] cursor-pointer"
              title="Fit to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {activeEvidenceFieldId && (
          <div className="p-2.5 bg-[#FAFAFC] border-b border-[#D9DEE7] text-xs flex items-center justify-between gap-2 text-[#111827]">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <Info className="w-3.5 h-3.5 text-[#111827] shrink-0" />
              <span>
                Viewing evidence for <strong className="text-[#111827] uppercase">{activeField?.label}</strong>
              </span>
            </div>
            <button
              onClick={onClearActiveEvidenceField}
              className="text-[10px] font-mono text-[#667085] hover:text-[#111827] underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Pan / Zoom Interactive Stage */}
        <div
          ref={imageContainerRef}
          onMouseDown={onMouseDownPan}
          onMouseMove={onMouseMovePan}
          onMouseUp={onMouseUpPan}
          onMouseLeave={onMouseUpPan}
          className={`relative w-full h-[380px] sm:h-[480px] bg-[#071B3A]/5 flex items-center justify-center overflow-hidden select-none ${
            imageZoom > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
          }`}
        >
          {images.length > 0 && images[activeAnalysisImageIndex] ? (
            <div
              className="transition-transform duration-75 origin-center will-change-transform flex items-center justify-center w-full h-full"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${imageZoom})`,
              }}
            >
              <img
                src={images[activeAnalysisImageIndex].previewUrl}
                alt={images[activeAnalysisImageIndex].name}
                className="max-w-full max-h-full object-contain pointer-events-none"
              />
            </div>
          ) : (
            <div className="text-center p-6 space-y-2">
              <p className="text-xs text-[#667085] font-mono">No package image available.</p>
              <button
                onClick={onReturnToCapture}
                className="px-3 py-1.5 bg-[#071B3A] text-[#FFFFFF] text-xs rounded-xs"
              >
                Return to Capture
              </button>
            </div>
          )}

          {imageZoom > 1 && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-[#071B3A]/80 text-[#FFFFFF] text-[10px] font-mono rounded-2xs pointer-events-none">
              Drag to pan around image
            </div>
          )}
        </div>

        {/* Thumbnails Row */}
        {images.length > 1 && (
          <div className="p-3 bg-[#E8F0FC] border-t border-[#D9DEE7]">
            <div className="text-[10px] font-mono font-bold uppercase text-[#667085] mb-2">
              PACKAGE EVIDENCE VIEWS ({images.length})
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => {
                    setActiveAnalysisImageIndex(idx);
                    onResetZoom();
                  }}
                  className={`relative w-14 h-14 shrink-0 rounded-xs border overflow-hidden transition-all cursor-pointer ${
                    activeAnalysisImageIndex === idx
                      ? 'border-[#071B3A] ring-2 ring-[#071B3A]/20'
                      : 'border-[#D9DEE7] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.previewUrl}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0.5 right-0.5 px-1 bg-[#071B3A]/80 text-[#FFFFFF] text-[8px] font-mono rounded-2xs">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Advisory Information Card */}
      <div className="p-4 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs text-xs space-y-1 shadow-2xs">
        <div className="font-serif font-bold text-sm text-[#111827] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#111827]" />
          <span>Extraction is an assistive step</span>
        </div>
        <p className="text-[#667085] leading-relaxed">
          Optical Character Recognition can misread small, distorted, reflective, or partially obscured text. Always compare extracted information with the original package image before continuing.
        </p>
      </div>
    </div>
  );
};

export const HighResZoomModal: React.FC<{
  zoomModalUrl: string | null;
  onClose: () => void;
}> = ({ zoomModalUrl, onClose }) => {
  return (
    <AnimatePresence>
      {zoomModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#071B3A]/80 backdrop-blur-2xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="bg-[#FFFFFF] border border-[#D9DEE7] max-w-4xl w-full p-4 rounded-xs shadow-2xl relative z-10 max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7] mb-3">
              <span className="text-xs font-mono font-semibold text-[#111827]">
                High-Resolution Evidence View
              </span>
              <button
                onClick={onClose}
                className="p-1 text-[#667085] hover:text-[#111827] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs flex items-center justify-center p-2">
              <img
                src={zoomModalUrl}
                alt="High-resolution evidence"
                className="max-w-full max-h-[75vh] object-contain"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
