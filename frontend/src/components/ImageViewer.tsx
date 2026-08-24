/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageViewerProps {
  imageUrl: string | null;
  onClose: () => void;
  title?: string;
}

export function ImageViewer({ imageUrl, onClose, title = 'High-Resolution Evidence View' }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);

  if (!imageUrl) return null;

  return (
    <AnimatePresence>
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
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-semibold text-[#111827]">
                {title}
              </span>
              <div className="flex items-center gap-1 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs px-2 py-0.5">
                <button
                  onClick={() => setZoom((prev) => Math.min(prev + 0.25, 3))}
                  className="p-0.5 text-[#667085] hover:text-[#111827] cursor-pointer"
                  title="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-[#667085] px-1">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((prev) => Math.max(prev - 0.25, 0.5))}
                  className="p-0.5 text-[#667085] hover:text-[#111827] cursor-pointer"
                  title="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="p-0.5 text-[#667085] hover:text-[#111827] cursor-pointer ml-1"
                  title="Reset zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-[#667085] hover:text-[#111827] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-auto bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs flex items-center justify-center p-2 min-h-[300px]">
            <img
              src={imageUrl}
              alt="High-resolution evidence"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
              className="max-w-full max-h-[75vh] object-contain transition-transform duration-150"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
