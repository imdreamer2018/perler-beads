'use client';

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onConfirm: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
}

/**
 * 创建裁剪后的图片
 */
function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('无法获取 canvas context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // 设置画布大小为裁剪区域大小
  canvas.width = crop.width;
  canvas.height = crop.height;

  // 绘制裁剪后的图片
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  // 转换为 Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas 转换为 Blob 失败'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
}

export default function ImageCropModal({
  isOpen,
  imageSrc,
  onConfirm,
  onCancel,
}: ImageCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);

  const handleConfirm = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      alert('请先调整裁剪区域');
      return;
    }
    
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      onConfirm(croppedBlob);
    } catch (error) {
      console.error('裁剪图片失败:', error);
      alert('裁剪图片失败，请重试');
    }
  }, [completedCrop, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            裁剪图片
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 裁剪区域 */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-900">
          <div className="flex items-center justify-center min-h-full">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={undefined}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="裁剪预览"
                style={{ maxWidth: '100%', maxHeight: '70vh' }}
                onLoad={(e) => {
                  const { width, height } = e.currentTarget;
                  // 初始化裁剪区域为图片的80%
                  setCrop({
                    unit: '%',
                    x: 10,
                    y: 10,
                    width: 80,
                    height: 80,
                  });
                }}
              />
            </ReactCrop>
          </div>
        </div>

        {/* 控制栏 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {/* 提示文字 */}
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              拖动边角可以调整裁剪框大小
            </p>
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              拖动裁剪框可以移动位置
            </p>
          </div>

          {/* 按钮组 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium"
            >
              确认裁剪
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
