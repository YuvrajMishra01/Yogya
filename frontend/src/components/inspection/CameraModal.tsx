/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onClose: () => void;
  onCapturePhoto: () => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  videoRef,
  onClose,
  onCapturePhoto,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#071B3A]/70 backdrop-blur-2xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#FFFFFF] border border-[#D9DEE7] max-w-lg w-full p-4 sm:p-6 rounded-xs shadow-2xl relative z-10 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7]">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#111827]" />
                <h3 className="text-sm font-serif font-bold text-[#111827]">
                  Camera Viewfinder
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-[#667085] hover:text-[#111827] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-4/3 bg-[#071B3A] rounded-xs overflow-hidden flex items-center justify-center border border-[#0D2A55]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-8 border border-dashed border-[#FAFAFC]/40 pointer-events-none rounded-xs flex items-center justify-center">
                <span className="text-[10px] font-mono uppercase text-[#FFFFFF]/60 bg-[#071B3A]/60 px-2 py-0.5 rounded-2xs">
                  Align package declarations
                </span>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onCapturePhoto}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 bg-[#071B3A] hover:bg-[#0D2A55] text-xs font-semibold text-[#FFFFFF] rounded-xs transition-colors cursor-pointer shadow-2xs text-center"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Photo</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
