'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { DownloadOptions } from '../types';
import { useHtmlDownload } from '../hooks/useCanvasDownload';

interface DownloadControlsProps {
  elementRef: React.RefObject<HTMLDivElement | null>;
}

export function DownloadControls({ elementRef }: DownloadControlsProps) {
  const { downloadImage } = useHtmlDownload();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadWithFrame = async () => {
    if (!elementRef.current) {
      alert('Preview not ready. Please wait a moment and try again.');
      return;
    }

    setIsDownloading(true);
    try {
      await downloadImage(elementRef.current, { includeFrame: true, quality: 1.0 });
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadWithoutFrame = async () => {
    if (!elementRef.current) {
      alert('Preview not ready. Please wait a moment and try again.');
      return;
    }

    setIsDownloading(true);
    try {
      await downloadImage(elementRef.current, { includeFrame: false, quality: 1.0 });
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleDownloadWithFrame}
        disabled={isDownloading}
        className="w-full"
        size="lg"
      >
        {isDownloading ? 'Generating Image...' : 'Download PNG (with frame)'}
      </Button>
      
      <Button
        onClick={handleDownloadWithoutFrame}
        disabled={isDownloading}
        className="w-full"
        size="lg"
        variant="outline"
      >
        {isDownloading ? 'Generating Image...' : 'Download Screenshot'}
      </Button>
    </div>
  );
}