/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { INSPECTION_STEPS, STEP_HEADINGS } from '../../utils/inspectionHelpers';

interface InspectionProgressProps {
  currentStep: number;
  onSetStep: (step: number) => void;
  navigate: (path: string) => void;
  imagesCount: number;
  onDiscardClick: () => void;
  validationError: string | null;
  cameraError: string | null;
  onClearErrors: () => void;
}

export const InspectionProgress: React.FC<InspectionProgressProps> = ({
  currentStep,
  onSetStep,
  navigate,
  imagesCount,
  onDiscardClick,
  validationError,
  cameraError,
  onClearErrors,
}) => {
  const heading = STEP_HEADINGS[currentStep] || STEP_HEADINGS[0];

  return (
    <div className="space-y-6">
      {/* Workspace Top Header */}
      <div className="pb-4 border-b border-[#D9DEE7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {currentStep === 0 && (
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#667085] hover:text-[#111827] mb-2 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Overview</span>
            </button>
          )}
          {currentStep === 1 && (
            <button
              onClick={() => onSetStep(0)}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#667085] hover:text-[#111827] mb-2 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Image Capture</span>
            </button>
          )}
          {currentStep === 2 && (
            <button
              onClick={() => onSetStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#667085] hover:text-[#111827] mb-2 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Image Review</span>
            </button>
          )}
          {currentStep === 3 && (
            <button
              onClick={() => onSetStep(2)}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#667085] hover:text-[#111827] mb-2 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Declaration Analysis</span>
            </button>
          )}

          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block px-1.5 py-0.5 bg-[#071B3A] text-[#FFFFFF] text-[9px] font-mono font-bold uppercase tracking-wider rounded-2xs">
              {currentStep === 0 && '01 / CAPTURE'}
              {currentStep === 1 && '02 / REVIEW'}
              {currentStep === 2 && '03 / ANALYZE'}
              {currentStep === 3 && '04 / RESULTS'}
            </span>
            <span className="text-[10px] font-mono text-[#667085]">
              L.M. (P.C.) RULES, 2011
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#111827] tracking-tight">
            {heading.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
            {heading.subtitle}
          </p>
        </div>

        {/* Reference and Discard Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <div className="px-3 py-1.5 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs text-left">
            <div className="text-[9px] font-mono text-[#667085] uppercase leading-none">
              INSPECTION
            </div>
            <div className="text-xs font-mono font-semibold text-[#111827] leading-tight">
              {imagesCount > 0 ? `${imagesCount} ${imagesCount === 1 ? 'image' : 'images'} loaded` : 'New inspection'}
            </div>
          </div>

          {imagesCount > 0 && (
            <button
              onClick={onDiscardClick}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FFFFFF] hover:bg-[#E8F0FC] border border-[#D9DEE7] text-xs font-medium text-[#667085] hover:text-[#111827] rounded-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#667085]" />
              <span>Discard inspection</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-3 sm:p-4 rounded-xs shadow-2xs">
        <div className="hidden sm:grid grid-cols-4 gap-2">
          {INSPECTION_STEPS.map((item, idx) => {
            const isActive = currentStep === idx;
            const isCompleted = currentStep > idx;
            return (
              <div
                key={item.num}
                className={`p-3 rounded-xs border transition-all ${
                  isActive
                    ? 'bg-[#071B3A] text-[#FFFFFF] border-[#071B3A]'
                    : isCompleted
                    ? 'bg-[#E8F0FC] text-[#111827] border-[#D9DEE7]'
                    : 'bg-[#FAFAFC]/50 text-[#667085] border-[#D9DEE7]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold tracking-wider ${isActive ? 'text-[#D9DEE7]' : 'text-[#667085]'}`}>
                    {item.num}
                  </span>
                  {isCompleted && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#111827]" />
                  )}
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-[#FAFAFC] animate-pulse"></span>
                  )}
                </div>
                <div className={`text-xs font-mono font-bold tracking-wider uppercase ${isActive ? 'text-[#FFFFFF]' : 'text-[#111827]'}`}>
                  {item.title}
                </div>
                <div className={`text-[10px] truncate ${isActive ? 'text-[#D9DEE7]' : 'text-[#667085]'}`}>
                  {item.desc}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sm:hidden flex items-center justify-between gap-1.5 overflow-x-auto pb-0.5">
          {INSPECTION_STEPS.map((item, idx) => {
            const isActive = currentStep === idx;
            const isCompleted = currentStep > idx;
            return (
              <div
                key={item.num}
                className={`flex-1 min-w-[70px] p-2 rounded-xs border text-center transition-colors ${
                  isActive
                    ? 'bg-[#071B3A] text-[#FFFFFF] border-[#071B3A]'
                    : isCompleted
                    ? 'bg-[#E8F0FC] text-[#111827] border-[#D9DEE7]'
                    : 'bg-[#FAFAFC]/50 text-[#667085] border-[#D9DEE7]/60'
                }`}
              >
                <div className="text-[9px] font-mono font-bold">
                  {item.num}
                </div>
                <div className="text-[10px] font-mono font-bold uppercase truncate">
                  {item.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inline Error Notification */}
      <AnimatePresence>
        {(validationError || cameraError) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3.5 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs flex items-start justify-between gap-3 text-xs text-[#111827] shadow-2xs"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#667085] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-[#111827]">
                  {validationError ? 'Upload error' : 'Camera notice'}
                </span>
                <span className="text-[#667085]">
                  {validationError || cameraError}
                </span>
              </div>
            </div>
            <button
              onClick={onClearErrors}
              className="p-1 text-[#667085] hover:text-[#111827] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
