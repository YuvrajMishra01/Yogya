import os
import cv2
import numpy as np
from PIL import Image

class OCRPreprocessor:
    """
    OpenCV Image Preprocessing Pipeline for Legal Metrology Package Labels
    Applies Denoising, Contrast CLAHE, Otsu Binarization, and Deskewing.
    """
    @staticmethod
    def preprocess_image(image_path: str) -> np.ndarray:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at path: {image_path}")

        # Load image via OpenCV
        img = cv2.imread(image_path)
        if img is None:
            # Fallback to PIL load and convert to numpy
            pil_img = Image.open(image_path).convert('RGB')
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

        # 1. Convert to Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 2. Light Bilateral Filtering (preserves text edges while smoothing background noise)
        filtered = cv2.bilateralFilter(gray, d=5, sigmaColor=50, sigmaSpace=50)

        # 3. CLAHE Contrast Equalization (boosts subtle text contrast on dark/reflective packages)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        contrast_enhanced = clahe.apply(filtered)

        return contrast_enhanced

    @staticmethod
    def binarize_image(gray_image: np.ndarray) -> np.ndarray:
        """Adaptive thresholding fallback for high-noise dark background images."""
        return cv2.adaptiveThreshold(
            gray_image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 15, 8
        )

    @staticmethod
    def deskew_image(image: np.ndarray) -> np.ndarray:
        """
        Calculates skew angle and rotates image matrix if skew angle > 1.0 degree.
        """
        coords = np.column_stack(np.where(image > 0))
        if len(coords) == 0:
            return image
        
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle

        if abs(angle) < 1.0 or abs(angle) > 45.0:
            return image

        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        return rotated
