/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2 } from 'lucide-react';

interface DiscardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DiscardModal: React.FC<DiscardModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
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
            className="fixed inset-0 bg-[#071B3A]/50 backdrop-blur-2xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="bg-[#FFFFFF] border border-[#D9DEE7] max-w-sm w-full p-6 rounded-xs shadow-xl relative z-10 text-center"
          >
            <div className="w-10 h-10 bg-[#E8F0FC] border border-[#D9DEE7] rounded-xs flex items-center justify-center mx-auto mb-4 text-[#111827]">
              <Trash2 className="w-5 h-5" />
            </div>

            <h3 className="text-base font-serif font-bold text-[#111827] mb-2">
              Discard this inspection?
            </h3>

            <p className="text-xs text-[#667085] leading-relaxed mb-6">
              Uploaded images will be removed from this session.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="w-full py-2.5 bg-[#C62828] hover:bg-[#C62828]/90 text-xs font-medium text-[#FFFFFF] rounded-xs transition-colors cursor-pointer"
              >
                Discard
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
