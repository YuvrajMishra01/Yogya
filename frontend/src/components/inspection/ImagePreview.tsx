/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Trash2,
  ZoomIn,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { InspectionImageItem } from '../../types';
import { formatFileSize } from '../../utils/helpers';

interface ImagePreviewProps {
  images: InspectionImageItem[];
  onAddMoreImages: () => void;
  onRemoveImage: (id: string) => void;
  onInspectImage: (url: string) => void;
  onReturnToCapture: () => void;
  onContinueToAnalysis: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  onAddMoreImages,
  onRemoveImage,
  onInspectImage,
  onReturnToCapture,
  onContinueToAnalysis,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-5 sm:p-6 rounded-xs shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D9DEE7] mb-5 gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#667085] block mb-1">
              02 / REVIEW
            </span>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#111827]">
              Review captured images
            </h2>
            <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
              Make sure the package and its declarations are clearly visible before continuing.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={onAddMoreImages}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add more images</span>
            </button>
          </div>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs p-3.5 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#D9DEE7]">
                <span className="text-xs font-mono font-bold text-[#111827]">
                  IMAGE {String(idx + 1).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveImage(img.id)}
                  className="text-xs font-mono text-[#667085] hover:text-[#C62828] transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>

              <div
                onClick={() => onInspectImage(img.previewUrl)}
                className="aspect-4/3 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs overflow-hidden flex items-center justify-center relative group cursor-pointer"
              >
                <img
                  src={img.previewUrl}
                  alt={img.name}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-[#071B3A]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#FFFFFF] text-xs font-mono gap-1">
                  <ZoomIn className="w-4 h-4" />
                  <span>Click to inspect</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D9DEE7] flex items-center justify-between text-xs text-[#667085] font-mono">
                <span className="truncate max-w-[170px]" title={img.name}>
                  {img.name}
                </span>
                <span>{formatFileSize(img.size)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Review Bottom Action Bar */}
        <div className="pt-4 border-t border-[#D9DEE7] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReturnToCapture}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Capture</span>
          </button>

          <button
            type="button"
            onClick={onContinueToAnalysis}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
          >
            <span>Continue to Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </motion.div>
  );
};
