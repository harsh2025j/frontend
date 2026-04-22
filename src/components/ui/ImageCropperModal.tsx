"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';

// Helper function to create an image element
const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

// Helper function to extract the cropped portion
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: any,
  fileName: string
): Promise<File | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // set canvas size to match the bounding box
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        // Maintain the original file extension or fallback to jpeg
        const extension = fileName.split('.').pop()?.toLowerCase() || 'jpeg';
        const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

        const croppedFile = new File([blob], fileName, { type: mimeType });
        resolve(croppedFile);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/jpeg', 0.95);
  });
}

interface ImageCropperModalProps {
  imageFile: File;
  onClose: () => void;
  onCrop: (croppedFile: File) => void;
  aspect?: number; // e.g., 16/9 or 1/1
  title?: string;
  description?: string;
  loading?: boolean;
}

export default function ImageCropperModal({ 
  imageFile, 
  onClose, 
  onCrop, 
  aspect = 16 / 9,
  title = "Adjust Image",
  description = "Drag and zoom to position exactly what will appear",
  loading = false
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    // Prevent scrolling on the body when modal is open
    document.body.style.overflow = 'hidden';

    const objectUrl = URL.createObjectURL(imageFile);
    setImageSrc(objectUrl);

    return () => {
      document.body.style.overflow = 'unset';
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (imageSrc && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, imageFile.name);
        if (croppedImage) {
          onCrop(croppedImage);
        }
      } catch (e) {
        console.error('Failed to crop image', e);
      }
    }
  };

  if (!imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh] max-h-[800px]">

        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-white">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative flex-1 bg-gray-900 overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            showGrid={true}
          />
        </div>

        {/* Controls */}
        <div className="p-5 border-t bg-white">
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">

            <div className="flex items-center gap-4 w-full sm:w-1/2">
              <span className="text-sm font-medium text-gray-600">Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.05}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCrop}
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 min-w-[80px]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  "Done"
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
