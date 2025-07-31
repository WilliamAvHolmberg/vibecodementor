'use client';

import { useCallback } from 'react';
import { DownloadOptions } from '../types';
import html2canvas from 'html2canvas-pro';

export function useHtmlDownload() {
  const downloadImage = useCallback(async (
    element: HTMLElement | null,
    options: DownloadOptions = { includeFrame: true, quality: 1.0 }
  ) => {
    if (!element) {
      console.error('Element reference not found');
      alert('Unable to find the element to download. Please try again.');
      return;
    }

    try {
      console.log('Starting download process...', { element, options });

      

      if (typeof html2canvas !== 'function') {
        throw new Error('html2canvas failed to load properly');
      }

      console.log('html2canvas loaded successfully');

      // Wait a bit to ensure all styles are applied
      await new Promise(resolve => setTimeout(resolve, 100));

              // First, create a temporary clone and fix colors before html2canvas
        const tempElement = element.cloneNode(true) as HTMLElement;
        document.body.appendChild(tempElement);
        tempElement.style.position = 'absolute';
        tempElement.style.left = '-9999px';
        tempElement.style.top = '-9999px';
        
        // Force all elements to use RGB colors by applying inline styles
        const allElements = tempElement.querySelectorAll('*');
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          const computedStyle = window.getComputedStyle(el);
          
          // Override problematic background colors
          if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            try {
              htmlEl.style.backgroundColor = computedStyle.backgroundColor;
            } catch (e) {
              // Fallback for problematic colors
              if (htmlEl.classList.contains('bg-black')) htmlEl.style.backgroundColor = 'rgb(0, 0, 0)';
              else if (htmlEl.classList.contains('bg-white')) htmlEl.style.backgroundColor = 'rgb(255, 255, 255)';
              else if (htmlEl.className.includes('bg-gradient')) htmlEl.style.background = 'linear-gradient(to bottom, rgb(59, 130, 246), rgb(168, 85, 247), rgb(126, 34, 206))';
              else htmlEl.style.backgroundColor = 'rgb(59, 130, 246)'; // Default blue
            }
          }
          
          // Override text colors
          if (computedStyle.color) {
            try {
              htmlEl.style.color = computedStyle.color;
            } catch (e) {
              htmlEl.style.color = 'rgb(255, 255, 255)'; // Default white
            }
          }
        });

        // Capture the cleaned element as canvas
        const canvas = await html2canvas(tempElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          width: tempElement.offsetWidth,
          height: tempElement.offsetHeight,
          logging: false,
          removeContainer: true
        });
        
        // Clean up temporary element
        document.body.removeChild(tempElement);

      console.log('Canvas created successfully', { width: canvas.width, height: canvas.height });

      // Create download link
      const link = document.createElement('a');
      link.download = `fake-iphone-lockscreen-${Date.now()}.png`;

      // For PNG, quality parameter is ignored, but we'll use it anyway
      link.href = canvas.toDataURL('image/png');

      console.log('Download link created, triggering download...');

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('Download triggered successfully');

    } catch (error) {
      console.error('Failed to download image:', error);

      // Better error message
      if (error instanceof Error) {
        if (error.message.includes('html2canvas')) {
          alert('Error loading html2canvas library. Please refresh the page and try again.');
        } else if (error.message.includes('Canvas')) {
          alert('Error creating image canvas. This might be due to CORS issues or browser security settings.');
        } else {
          alert(`Download failed: ${error.message}. Please try again.`);
        }
      } else {
        alert('Failed to download image. Please try again.');
      }
    }
  }, []);

  return { downloadImage };
}