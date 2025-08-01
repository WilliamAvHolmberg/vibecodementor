'use client';

import Image from 'next/image';

interface AppIconProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  customUrl?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-10 h-10'
};

export function AppIcon({ src, alt, size = 'md', className = '', customUrl }: AppIconProps) {
  const sizeClass = sizeClasses[size];
  const imageSrc = customUrl || `/app-icons/${src}`;
  
  return (
    <div className={`${sizeClass} rounded-lg overflow-hidden flex items-center justify-center ${className}`}>
      <Image
        src={imageSrc}
        alt={alt}
        width={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
        height={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Show a default fallback if image fails
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">?</div>`;
          }
        }}
      />
    </div>
  );
} 