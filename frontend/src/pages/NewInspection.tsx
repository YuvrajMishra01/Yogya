/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { InspectionReport, InspectionImageItem, DeclarationField } from '../types';
import { parseDeclarationsFromOcr } from '../lib/compliance';
import { api } from '../lib/api';

import { InspectionProgress } from '../components/inspection/InspectionProgress';
import { ImageUpload } from '../components/inspection/ImageUpload';
import { ImagePreview } from '../components/inspection/ImagePreview';
import { EvidenceViewer, HighResZoomModal } from '../components/inspection/EvidenceViewer';
import { AnalysisPanel } from '../components/inspection/AnalysisPanel';
import { CompliancePanel } from '../components/inspection/CompliancePanel';
import { CameraModal } from '../components/inspection/CameraModal';
import { DiscardModal } from '../components/inspection/DiscardModal';

interface NewInspectionProps {
  navigate: (path: string) => void;
  onSaveReport?: (report: InspectionReport) => void;
}

export default function NewInspection({ navigate, onSaveReport }: NewInspectionProps) {
  // Workflow Step State (0: CAPTURE, 1: REVIEW, 2: ANALYZE, 3: RESULTS)
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Uploaded Images State
  const [images, setImages] = useState<InspectionImageItem[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [activeAnalysisImageIndex, setActiveAnalysisImageIndex] = useState<number>(0);

  // Drag and Drop & Validation States
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Camera States
  const [cameraModalOpen, setCameraModalOpen] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Dialogs & Modals
  const [discardModalOpen, setDiscardModalOpen] = useState<boolean>(false);
  const [zoomModalUrl, setZoomModalUrl] = useState<string | null>(null);

  // Analysis Image Viewer Zoom & Pan States
  const [imageZoom, setImageZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // OCR Processing States
  const [ocrStatus, setOcrStatus] = useState<
    'idle' | 'preparing' | 'reading' | 'identifying' | 'completed' | 'error'
  >('idle');
  const [ocrProgressText, setOcrProgressText] = useState<string>('');
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrConfidenceScore, setOcrConfidenceScore] = useState<number | null>(null);
  const [rawOcrText, setRawOcrText] = useState<string>('');
  const [editedRawOcrText, setEditedRawOcrText] = useState<string>('');
  const [isEditingRawText, setIsEditingRawText] = useState<boolean>(false);
  const [showRawTextPanel, setShowRawTextPanel] = useState<boolean>(true);

  // Declarations State
  const [declarations, setDeclarations] = useState<DeclarationField[]>(() =>
    parseDeclarationsFromOcr('', 0)
  );
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [activeEvidenceFieldId, setActiveEvidenceFieldId] = useState<string | null>(null);

  // Manual Inspector Review Checklist
  const [inspectorChecklist, setInspectorChecklist] = useState({
    identity: false,
    declarations: false,
    corrections: false,
    evidence: false,
  });
  const [finalReviewConfirmed, setFinalReviewConfirmed] = useState<boolean>(false);
  const [reviewErrorNotice, setReviewErrorNotice] = useState<string | null>(null);

  // Compliance Step 04 Observations & Sign-off
  const [inspectorObservations, setInspectorObservations] = useState<string>('');
  const [complianceSignoff, setComplianceSignoff] = useState<boolean>(false);
  const [generatedReportNotice, setGeneratedReportNotice] = useState<string | null>(null);

  // Hidden File & Camera Input References
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [images, cameraStream]);

  // Adjust active index if images length changes
  useEffect(() => {
    if (selectedImageIndex >= images.length && images.length > 0) {
      setSelectedImageIndex(images.length - 1);
    }
  }, [images.length, selectedImageIndex]);

  // Handle file validation and addition
  const processFiles = (fileList: FileList | File[]) => {
    setValidationError(null);
    setCameraError(null);
    const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10 MB

    const newItems: InspectionImageItem[] = [];
    let encounteredInvalidType = false;
    let encounteredOversized = false;

    Array.from(fileList).forEach((file) => {
      const isTypeValid =
        validExtensions.includes(file.type.toLowerCase()) ||
        /\.(jpg|jpeg|png|webp)$/i.test(file.name);

      if (!isTypeValid) {
        encounteredInvalidType = true;
        return;
      }

      if (file.size > maxSizeBytes) {
        encounteredOversized = true;
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        id: Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'image/jpeg',
        previewUrl,
      });
    });

    if (encounteredInvalidType) {
      setValidationError('This file type is not supported.');
    } else if (encounteredOversized) {
      setValidationError('This image is larger than 10 MB. Please choose a smaller file.');
    }

    if (newItems.length > 0) {
      setImages((prev) => [...prev, ...newItems]);
      if (images.length === 0) {
        setSelectedImageIndex(0);
      }
      setCreatedInspectionId(null);
      setOcrStatus('idle');
      setRawOcrText('');
      setEditedRawOcrText('');
      setOcrConfidenceScore(null);
      setDeclarations(parseDeclarationsFromOcr('', 0));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Remove single image
  const removeImage = (idToRemove: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setImages((prev) => {
      const target = prev.find((img) => img.id === idToRemove);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const updated = prev.filter((img) => img.id !== idToRemove);
      if (updated.length === 0 && currentStep > 0) {
        setCurrentStep(0);
      }
      return updated;
    });
  };

  // Confirm discard entire inspection
  const confirmDiscard = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setSelectedImageIndex(0);
    setCurrentStep(0);
    setValidationError(null);
    setCameraError(null);
    setDiscardModalOpen(false);
  };

  // Camera Handler
  const startCameraCapture = async () => {
    setValidationError(null);
    setCameraError(null);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        setCameraStream(stream);
        setCameraModalOpen(true);
      } catch {
        setCameraError(
          'Camera access is unavailable. You can upload an image from your device instead.'
        );
        if (cameraInputRef.current) {
          cameraInputRef.current.click();
        }
      }
    } else {
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        setCameraError(
          'Camera access is unavailable. You can upload an image from your device instead.'
        );
      }
    }
  };

  // When camera stream is active, bind to video element
  useEffect(() => {
    if (cameraModalOpen && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraModalOpen, cameraStream]);

  // Capture frame from active camera
  const capturePhotoFromStream = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const fileName = `package-capture-${images.length + 1}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            processFiles([file]);
            closeCameraModal();
          }
        },
        'image/jpeg',
        0.92
      );
    }
  };

  const closeCameraModal = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraModalOpen(false);
  };

  const [createdInspectionId, setCreatedInspectionId] = useState<string | null>(null);

  // Trigger OCR analysis when entering Step 2 if not yet executed
  useEffect(() => {
    if (currentStep === 2 && ocrStatus === 'idle' && images.length > 0) {
      runOcrAnalysis();
    }
  }, [currentStep, ocrStatus, images.length]);

  // Real backend OCR pipeline & declaration extraction
  const runOcrAnalysis = async () => {
    if (images.length === 0) return;
    setOcrStatus('preparing');
    setOcrError(null);
    setOcrProgressText('Uploading evidence image to backend OCR server…');

    try {
      let inspectionId = createdInspectionId;

      if (!inspectionId) {
        const filesToUpload: File[] = images
          .map((img) => img.file)
          .filter((f): f is File => f instanceof File);

        const createdReport = await api.createInspection(filesToUpload);
        inspectionId = createdReport.id;
        setCreatedInspectionId(inspectionId);
      }

      setOcrStatus('reading');
      setOcrProgressText('Running Tesseract OCR engine on uploaded evidence image…');

      await api.processOCR(inspectionId);

      setOcrStatus('identifying');
      setOcrProgressText('Extracting Legal Metrology declarations and evaluating compliance…');

      let isCompleted = false;
      let attempts = 0;
      while (!isCompleted && attempts < 30) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
        const statusResp = await api.getOCRStatus(inspectionId);
        if (statusResp.status === 'completed') {
          isCompleted = true;
        } else if (statusResp.status === 'failed') {
          throw new Error(statusResp.error_message || 'OCR processing failed on server');
        }
      }

      const [ocrResults, inspectionData] = await Promise.all([
        api.getOCRResults(inspectionId),
        api.getInspectionById(inspectionId),
      ]);

      const avgConf = Math.round(ocrResults.average_confidence || 0);
      setOcrConfidenceScore(avgConf);
      setRawOcrText(ocrResults.raw_text || '');
      setEditedRawOcrText(ocrResults.raw_text || '');

      if (inspectionData.declarations && inspectionData.declarations.length > 0) {
        setDeclarations(inspectionData.declarations);
      } else {
        setDeclarations(parseDeclarationsFromOcr(ocrResults.raw_text || '', 0, avgConf));
      }

      setOcrStatus('completed');
      setOcrProgressText('');
    } catch (err: any) {
      console.error('OCR pipeline error:', err);
      setOcrStatus('error');
      setOcrError(err.message || 'Text could not be extracted reliably from this image.');
    }
  };

  const startManualReview = () => {
    setOcrStatus('completed');
    setOcrError(null);
    if (!rawOcrText) {
      setRawOcrText('');
      setEditedRawOcrText('');
      setDeclarations(parseDeclarationsFromOcr('', 0));
    }
  };

  const handleReparseRawText = () => {
    setRawOcrText(editedRawOcrText);
    const parsed = parseDeclarationsFromOcr(
      editedRawOcrText,
      activeAnalysisImageIndex,
      ocrConfidenceScore || undefined
    );
    setDeclarations((prev) =>
      parsed.map((newField) => {
        const existing = prev.find((p) => p.id === newField.id);
        if (existing && existing.isEdited) {
          return existing;
        }
        return newField;
      })
    );
    setIsEditingRawText(false);
  };

  const handleUpdateDeclarationValue = (id: string, newValue: string) => {
    setDeclarations((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const trimmed = newValue.trim();
          return {
            ...f,
            currentValue: newValue,
            isEdited: true,
            status: trimmed ? 'DETECTED' : 'NOT_DETECTED',
            confidence: trimmed ? f.confidence : 'Review required',
          };
        }
        return f;
      })
    );
  };

  const handleViewEvidence = (imageIndex: number, fieldId: string) => {
    if (images[imageIndex]) {
      setActiveAnalysisImageIndex(imageIndex);
    }
    setActiveEvidenceFieldId(fieldId);
    setImageZoom(1.25);
  };

  // Zoom & Pan Handlers
  const handleZoomIn = () => {
    setImageZoom((prev) => Math.min(4, Number((prev + 0.25).toFixed(2))));
  };

  const handleZoomOut = () => {
    setImageZoom((prev) => Math.max(0.5, Number((prev - 0.25).toFixed(2))));
  };

  const handleResetZoom = () => {
    setImageZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleFitScreen = () => {
    setImageZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDownPan = (e: React.MouseEvent) => {
    if (imageZoom <= 1) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMovePan = (e: React.MouseEvent) => {
    if (!isPanning || imageZoom <= 1) return;
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  };

  const handleMouseUpPan = () => {
    setIsPanning(false);
  };

  const handleProceedToCompliance = () => {
    setReviewErrorNotice(null);
    if (!finalReviewConfirmed) {
      setReviewErrorNotice('Please review the extracted information before continuing.');
      return;
    }
    setCurrentStep(3);
  };

  return (
    <div className="space-y-6">
      {/* Hidden browser file & camera inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Progress & Header Component */}
      <InspectionProgress
        currentStep={currentStep}
        onSetStep={setCurrentStep}
        navigate={navigate}
        imagesCount={images.length}
        onDiscardClick={() => setDiscardModalOpen(true)}
        validationError={validationError}
        cameraError={cameraError}
        onClearErrors={() => {
          setValidationError(null);
          setCameraError(null);
        }}
      />

      {/* STEP 01: CAPTURE */}
      {currentStep === 0 && (
        <ImageUpload
          images={images}
          selectedImageIndex={selectedImageIndex}
          setSelectedImageIndex={setSelectedImageIndex}
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onChooseImages={() => fileInputRef.current?.click()}
          onStartCamera={startCameraCapture}
          onRemoveImage={removeImage}
          onInspectImage={(url) => setZoomModalUrl(url)}
          onProceedToReview={() => setCurrentStep(1)}
        />
      )}

      {/* STEP 02: REVIEW */}
      {currentStep === 1 && (
        <ImagePreview
          images={images}
          onAddMoreImages={() => fileInputRef.current?.click()}
          onRemoveImage={removeImage}
          onInspectImage={(url) => setZoomModalUrl(url)}
          onReturnToCapture={() => setCurrentStep(0)}
          onContinueToAnalysis={() => setCurrentStep(2)}
        />
      )}

      {/* STEP 03: ANALYZE */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6 space-y-4">
              <EvidenceViewer
                images={images}
                activeAnalysisImageIndex={activeAnalysisImageIndex}
                setActiveAnalysisImageIndex={setActiveAnalysisImageIndex}
                imageZoom={imageZoom}
                panOffset={panOffset}
                isPanning={isPanning}
                activeEvidenceFieldId={activeEvidenceFieldId}
                declarations={declarations}
                onClearActiveEvidenceField={() => setActiveEvidenceFieldId(null)}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
                onFitScreen={handleFitScreen}
                onMouseDownPan={handleMouseDownPan}
                onMouseMovePan={handleMouseMovePan}
                onMouseUpPan={handleMouseUpPan}
                onReturnToCapture={() => setCurrentStep(0)}
                imageContainerRef={imageContainerRef}
              />
            </div>

            <div className="lg:col-span-6 space-y-6">
              <AnalysisPanel
                ocrStatus={ocrStatus}
                ocrProgressText={ocrProgressText}
                ocrError={ocrError}
                ocrConfidenceScore={ocrConfidenceScore}
                rawOcrText={rawOcrText}
                editedRawOcrText={editedRawOcrText}
                setEditedRawOcrText={setEditedRawOcrText}
                isEditingRawText={isEditingRawText}
                setIsEditingRawText={setIsEditingRawText}
                showRawTextPanel={showRawTextPanel}
                setShowRawTextPanel={setShowRawTextPanel}
                declarations={declarations}
                editingFieldId={editingFieldId}
                setEditingFieldId={setEditingFieldId}
                activeEvidenceFieldId={activeEvidenceFieldId}
                inspectorChecklist={inspectorChecklist}
                setInspectorChecklist={setInspectorChecklist}
                finalReviewConfirmed={finalReviewConfirmed}
                setFinalReviewConfirmed={setFinalReviewConfirmed}
                reviewErrorNotice={reviewErrorNotice}
                setReviewErrorNotice={setReviewErrorNotice}
                onRunOcr={runOcrAnalysis}
                onStartManualReview={startManualReview}
                onReparseRawText={handleReparseRawText}
                onUpdateDeclarationValue={handleUpdateDeclarationValue}
                onViewEvidence={handleViewEvidence}
                onBackToImageReview={() => setCurrentStep(1)}
                onProceedToCompliance={handleProceedToCompliance}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 04: RESULTS */}
      {currentStep === 3 && (
        <CompliancePanel
          declarations={declarations}
          images={images}
          inspectorChecklist={inspectorChecklist}
          finalReviewConfirmed={finalReviewConfirmed}
          inspectorObservations={inspectorObservations}
          setInspectorObservations={setInspectorObservations}
          complianceSignoff={complianceSignoff}
          setComplianceSignoff={setComplianceSignoff}
          generatedReportNotice={generatedReportNotice}
          setGeneratedReportNotice={setGeneratedReportNotice}
          onSaveReport={onSaveReport}
          navigate={navigate}
          onBackToDeclarations={() => setCurrentStep(2)}
        />
      )}

      {/* Camera Modal */}
      <CameraModal
        isOpen={cameraModalOpen}
        videoRef={videoRef}
        onClose={closeCameraModal}
        onCapturePhoto={capturePhotoFromStream}
      />

      {/* Discard Inspection Modal */}
      <DiscardModal
        isOpen={discardModalOpen}
        onClose={() => setDiscardModalOpen(false)}
        onConfirm={confirmDiscard}
      />

      {/* High-Resolution Zoom Modal */}
      <HighResZoomModal
        zoomModalUrl={zoomModalUrl}
        onClose={() => setZoomModalUrl(null)}
      />
    </div>
  );
}
