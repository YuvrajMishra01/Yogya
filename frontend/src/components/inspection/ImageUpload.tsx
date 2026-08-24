/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  Upload,
  Camera,
  ShieldCheck,
  Plus,
  ZoomIn,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  ArrowRight
} from 'lucide-react';
import { InspectionImageItem } from '../../types';
import { formatFileSize } from '../../utils/helpers';

interface ImageUploadProps {
  images: InspectionImageItem[];
  selectedImageIndex: number;
  setSelectedImageIndex: React.Dispatch<React.SetStateAction<number>>;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onChooseImages: () => void;
  onStartCamera: () => void;
  onRemoveImage: (id: string, e?: React.MouseEvent) => void;
  onInspectImage: (url: string) => void;
  onProceedToReview: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  selectedImageIndex,
  setSelectedImageIndex,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onChooseImages,
  onStartCamera,
  onRemoveImage,
  onInspectImage,
  onProceedToReview,
}) => {
  const currentActiveImage = images[selectedImageIndex] || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Column: Upload Box & Live Preview Area */}
        <div className="flex-1 w-full space-y-5">
          
          <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-5 sm:p-6 rounded-xs shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7] mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#667085]">
                  01 / CAPTURE
                </span>
                <span className="text-[10px] font-mono text-[#667085]">• PACKAGE EVIDENCE</span>
              </div>
              {images.length > 0 && (
                <span className="text-xs font-mono font-semibold text-[#111827]">
                  {images.length} {images.length === 1 ? 'image added' : 'images added'}
                </span>
              )}
            </div>

            <div className="mb-5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#111827] mb-1">
                Capture the package
              </h2>
              <p className="text-xs text-[#667085] leading-relaxed">
                Upload clear photographs of the product packaging. Include the front, back and any side or label areas containing mandatory declarations.
              </p>
            </div>

            {/* Dropzone Container */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-xs p-6 sm:p-8 text-center transition-all ${
                isDragging
                  ? 'border-[#071B3A] bg-[#E8F0FC]'
                  : 'border-[#D9DEE7] bg-[#FAFAFC] hover:bg-[#E8F0FC]/60'
              }`}
            >
              <div className="w-12 h-12 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs flex items-center justify-center mx-auto mb-3 text-[#111827] shadow-2xs">
                <Upload className="w-6 h-6 text-[#667085]" />
              </div>

              <h3 className="text-sm font-serif font-bold text-[#111827] mb-1">
                Upload package images
              </h3>

              <p className="text-xs text-[#667085] mb-2">
                Drag and drop images here, or browse from your device.
              </p>

              <p className="text-[11px] font-mono text-[#667085] mb-5">
                JPG, JPEG, PNG • Multiple images supported
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={onChooseImages}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-medium rounded-xs transition-colors cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Images</span>
                </button>

                <button
                  type="button"
                  onClick={onStartCamera}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFFFFF] hover:bg-[#E8F0FC] border border-[#D9DEE7] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#667085]" />
                  <span>Use Camera</span>
                </button>
              </div>
            </div>

          </div>

          {/* Uploaded Images Preview Carousel / Strip */}
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FFFFFF] border border-[#D9DEE7] p-5 sm:p-6 rounded-xs shadow-2xs space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7]">
                <div>
                  <div className="text-xs font-serif font-bold text-[#111827]">
                    Captured package preview
                  </div>
                  <div className="text-[10px] font-mono text-[#667085]">
                    {images.length} {images.length === 1 ? 'image' : 'images'} in current session
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={onChooseImages}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-[#D9DEE7] bg-[#FAFAFC] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add more images</span>
                </button>
              </div>

              {currentActiveImage && (
                <div className="space-y-3">
                  <div className="relative bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs overflow-hidden flex items-center justify-center min-h-[260px] sm:min-h-[340px] max-h-[460px] p-2">
                    <img
                      src={currentActiveImage.previewUrl}
                      alt={currentActiveImage.name}
                      className="max-h-[440px] max-w-full object-contain rounded-xs select-none"
                    />

                    <div className="absolute top-3 left-3 px-2 py-1 bg-[#071B3A]/90 text-[#FFFFFF] text-[10px] font-mono font-bold uppercase rounded-xs">
                      IMAGE {String(selectedImageIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={() => onInspectImage(currentActiveImage.previewUrl)}
                        title="Inspect high-res preview"
                        className="p-1.5 bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#111827] border border-[#D9DEE7] rounded-xs transition-colors cursor-pointer shadow-xs"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => onRemoveImage(currentActiveImage.id, e)}
                        title="Remove image"
                        className="p-1.5 bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#C62828] border border-[#D9DEE7] rounded-xs transition-colors cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs text-[#111827] transition-colors cursor-pointer shadow-xs"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs text-[#111827] transition-colors cursor-pointer shadow-xs"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <ImageIcon className="w-4 h-4 text-[#667085] shrink-0" />
                      <span className="font-mono font-semibold text-[#111827] truncate">
                        {currentActiveImage.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-[#667085] shrink-0">
                      <span>{formatFileSize(currentActiveImage.size)}</span>
                      <span>•</span>
                      <span>{currentActiveImage.type.replace('image/', '').toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Thumbnail Row */}
              <div>
                <div className="text-[10px] font-mono uppercase text-[#667085] mb-2 font-semibold">
                  PACKAGE THUMBNAILS ({images.length})
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {images.map((img, idx) => {
                    const isSelected = idx === selectedImageIndex;
                    return (
                      <div
                        key={img.id}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`group relative border rounded-xs p-1 bg-[#FAFAFC] transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#071B3A] ring-1 ring-[#071B3A] bg-[#FFFFFF]'
                            : 'border-[#D9DEE7] hover:border-[#667085]'
                        }`}
                      >
                        <div className="aspect-square bg-[#FFFFFF] rounded-xs overflow-hidden flex items-center justify-center">
                          <img
                            src={img.previewUrl}
                            alt={img.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="mt-1 px-0.5 flex items-center justify-between text-[9px] font-mono">
                          <span className="font-bold text-[#111827]">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="text-[#667085] truncate max-w-[60px]">
                            {formatFileSize(img.size)}
                          </span>
                        </div>
                        <button
                          onClick={(e) => onRemoveImage(img.id, e)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#C62828] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                          title="Remove"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Proceed Action */}
              <div className="pt-3 border-t border-[#D9DEE7] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[#667085]">
                  Ensure mandatory declarations (MRP, Net Qty, Mfg) are clearly legible.
                </div>
                <button
                  type="button"
                  onClick={onProceedToReview}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
                >
                  <span>Review Images</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </motion.div>
          )}

        </div>

        {/* Right Column: Guidance & Recommended Views */}
        <div className="w-full lg:w-80 shrink-0 space-y-5">
          
          <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-5 rounded-xs shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#D9DEE7] mb-3">
              <ShieldCheck className="w-4 h-4 text-[#111827]" />
              <h3 className="text-xs font-serif font-bold text-[#111827]">
                Image quality checklist
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-[#667085] leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="text-[#287A52] font-bold">✓</span>
                <span>Text should be clearly visible.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#287A52] font-bold">✓</span>
                <span>Product labels should not be heavily blurred.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#287A52] font-bold">✓</span>
                <span>Avoid strong reflections on packaging.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#287A52] font-bold">✓</span>
                <span>Capture all relevant sides of the package.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#287A52] font-bold">✓</span>
                <span>Keep the package reasonably centered.</span>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-5 rounded-xs shadow-2xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#D9DEE7] mb-3">
              <h3 className="text-xs font-serif font-bold text-[#111827]">
                Recommended package views
              </h3>
              <span className="text-[9px] font-mono uppercase text-[#667085]">
                GUIDANCE
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
                <div className="text-[10px] font-mono font-bold text-[#111827] uppercase mb-0.5">
                  FRONT
                </div>
                <p className="text-xs text-[#667085]">
                  Product identity and primary declarations
                </p>
              </div>

              <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
                <div className="text-[10px] font-mono font-bold text-[#111827] uppercase mb-0.5">
                  BACK
                </div>
                <p className="text-xs text-[#667085]">
                  Manufacturer, importer and additional declarations
                </p>
              </div>

              <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
                <div className="text-[10px] font-mono font-bold text-[#111827] uppercase mb-0.5">
                  SIDE / LABEL
                </div>
                <p className="text-xs text-[#667085]">
                  Net quantity, dates and other relevant information
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#D9DEE7] text-[11px] text-[#667085]">
              Upload as many packaging angles as required for statutory verification.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
