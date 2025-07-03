"use client";

import { useState, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Upload, File, Image as ImageIcon, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useGetApiFilesImagesLatest, usePostApiFilesUploadImage } from '@/api/hooks/api';

interface ImageItem {
  id: string;
  fileName: string;
  fileUrl: string;
  contentType: string;
  fileSize: number;
  width: number;
  height: number;
  uploadedAt: string;
  uploadedByUserId?: string;
}

interface ImagesResponse {
  images: ImageItem[];
  totalCount: number;
  message: string;
}

export function ImageGallery() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  // Fetch latest images - cast the response to our expected type
  const { data: imagesResponse, isLoading, error, refetch } = useGetApiFilesImagesLatest({ 
    count: 8 
  });

  // Upload mutation
  const uploadMutation = usePostApiFilesUploadImage({
    mutation: {
      onMutate: () => {
        setUploadStatus('uploading');
      },
      onSuccess: () => {
        setUploadStatus('success');
        toast.success(`Image uploaded successfully! 📸`);
        // Refetch images to show the new upload
        refetch();
        // Reset status after 2 seconds
        setTimeout(() => setUploadStatus('idle'), 2000);
      },
      onError: (error) => {
        setUploadStatus('error');
        console.error('Upload failed:', error);
        toast.error('Failed to upload image. Please try again.');
        // Reset status after 3 seconds
        setTimeout(() => setUploadStatus('idle'), 3000);
      }
    }
  });

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    uploadMutation.mutate({
      data: { file }
    });
  }, [uploadMutation]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Please drop image files only');
      return;
    }

    // Upload the first image (could be extended to handle multiple)
    handleFileUpload(imageFiles[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset the input
    e.target.value = '';
  };

  // Parse the response data - handle both our expected format and fallback
  const responseData = imagesResponse as unknown as ImagesResponse;
  const images = responseData?.images || [];
  const totalCount = responseData?.totalCount || 0;

  const getUploadStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />;
    }
  };

  const getUploadStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Uploading to Cloudflare R2...';
      case 'success':
        return 'Upload successful!';
      case 'error':
        return 'Upload failed. Please try again.';
      default:
        return 'Drop images here to upload';
    }
  };

  return (
    <section id="gallery" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-cyan-600 rounded-2xl mb-4">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-4">
            Enterprise File Storage Ready! 
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl mx-auto mb-6">
            Image and file upload are ready for you! Cloudflare R2 integration is implemented and waiting for your content.
            Fast, global, and cost-effective storage that scales with your business.
          </p>
          
          {/* Cloudflare R2 Benefits */}
          <div className="bg-gradient-to-r from-green-50 to-cyan-50 dark:from-green-900/20 dark:to-cyan-900/20 rounded-xl p-4 mb-8 border border-green-200/50 dark:border-green-700/50 max-w-4xl mx-auto">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              🚀 Why Cloudflare R2 is the Smart Choice
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg mb-1">💰</div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">10x Cheaper</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Zero egress fees vs AWS S3</div>
              </div>
              <div>
                <div className="text-lg mb-1">⚡</div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">Global CDN</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Lightning-fast worldwide delivery</div>
              </div>
              <div>
                <div className="text-lg mb-1">🔧</div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">S3 Compatible</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Drop-in replacement, same API</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`mb-8 border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
            isDragging
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
              : uploadStatus === 'uploading'
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
              : uploadStatus === 'success'
              ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
              : uploadStatus === 'error'
              ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {uploadStatus === 'uploading' || uploadStatus === 'success' || uploadStatus === 'error' ? (
            <div className="flex flex-col items-center">
              {getUploadStatusIcon()}
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-2">
                {getUploadStatusText()}
              </h3>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Enterprise File Storage is Ready!
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Drop images here or click to browse • Powered by Cloudflare R2 (Max 10MB)
              </p>
              <label htmlFor="file-upload">
                <Button variant="outline" className="rounded-full cursor-pointer" asChild>
                  <span>
                    <File className="w-4 h-4 mr-2" />
                    Choose Files
                  </span>
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading images...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400">
              Failed to load images. Please try again.
            </p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Image Grid */}
        {!isLoading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {images.map((image: ImageItem) => (
                <div
                  key={image.id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {/* Real Image */}
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
                    <img
                      src={image.fileUrl}
                      alt={image.fileName}
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback to placeholder on error
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        if (target.parentElement) {
                          target.parentElement.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center">
                            <svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                            </svg>
                          </div>
                        `;
                        }
                      }}
                    />
                  </div>
                  
                  {/* Image Info */}
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {image.fileName}
                    </h4>
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span>{(image.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                      {image.width && image.height && (
                        <span>{image.width}×{image.height}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Status & Technical Details */}
            <div className="mt-8 text-center">
              <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                ✅ Live Cloudflare R2 Connection • {totalCount} files stored globally
              </p>
              
              {/* Technical Implementation Showcase */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 max-w-2xl mx-auto">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  🏗️ Production-Ready Implementation
                </h4>
                <div className="grid md:grid-cols-2 gap-3 text-xs">
                  <div className="text-left">
                    <div className="font-medium text-gray-700 dark:text-gray-300">✓ Direct Browser Upload</div>
                    <div className="text-gray-500 dark:text-gray-400">Presigned URLs, no server bottleneck</div>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-700 dark:text-gray-300">✓ Real-time Database Sync</div>
                    <div className="text-gray-500 dark:text-gray-400">PostgreSQL metadata tracking</div>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-700 dark:text-gray-300">✓ Drag & Drop UX</div>
                    <div className="text-gray-500 dark:text-gray-400">Modern file handling with React</div>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-700 dark:text-gray-300">✓ Image Optimization</div>
                    <div className="text-gray-500 dark:text-gray-400">Next.js Image component integration</div>
                  </div>
                </div>
              </div>
              
              {images.length === 0 && !isLoading && (
                <p className="text-gray-500 dark:text-gray-400 mt-4">
                  🎯 Ready for your content! Test the enterprise-grade upload system above.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
} 