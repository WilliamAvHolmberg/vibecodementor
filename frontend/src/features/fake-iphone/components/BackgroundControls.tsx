'use client';

import { useState } from 'react';
import { LockScreenState } from '../types';

interface BackgroundControlsProps {
  state: LockScreenState;
  onUpdateBackground: (type: 'gradient' | 'image', url?: string) => void;
}

const DEFAULT_WALLPAPERS = [
  {
    name: 'Default',
    type: 'gradient' as const,
    preview: 'bg-gradient-to-b from-blue-500 via-purple-500 to-purple-700'
  },
  {
    name: 'Ocean',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=800&fit=crop',
  },
  {
    name: 'Mountains',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=800&fit=crop',
  },
  {
    name: 'Space',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=800&fit=crop',
  },
  {
    name: 'Forest',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=800&fit=crop',
  },
  {
    name: 'Sunset',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1495954484750-af469f2f9be5?w=400&h=800&fit=crop',
  }
];

export function BackgroundControls({ state, onUpdateBackground }: BackgroundControlsProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const isCurrentBackground = (wallpaper: typeof DEFAULT_WALLPAPERS[0]) => {
    if (wallpaper.type === 'gradient') {
      return state.backgroundType === 'gradient';
    }
    return state.backgroundType === 'image' && state.backgroundImageUrl === wallpaper.url;
  };

  const isCustomBackground = () => {
    return state.backgroundType === 'image' && 
           state.backgroundImageUrl && 
           !DEFAULT_WALLPAPERS.some(w => w.url === state.backgroundImageUrl);
  };

  const handleCustomClick = () => {
    if (!showCustomInput) {
      setShowCustomInput(true);
      setCustomUrl(isCustomBackground() ? state.backgroundImageUrl || '' : '');
    }
  };

  const handleCustomSubmit = () => {
    if (customUrl.trim()) {
      onUpdateBackground('image', customUrl.trim());
      setShowCustomInput(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-gray-700">Background</h4>
      </div>
      
      {/* Horizontal scrollable wallpaper slider */}
      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Default wallpapers */}
        {DEFAULT_WALLPAPERS.map((wallpaper) => (
          <button
            key={wallpaper.name}
            onClick={() => onUpdateBackground(wallpaper.type, wallpaper.url)}
            className={`relative flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              isCurrentBackground(wallpaper)
                ? 'border-blue-500 scale-105'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            title={wallpaper.name}
          >
            {wallpaper.type === 'gradient' ? (
              <div className={wallpaper.preview + ' w-full h-full'} />
            ) : (
              <img 
                src={wallpaper.url} 
                alt={wallpaper.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
          </button>
        ))}
        
        {/* Custom wallpaper option */}
        <button
          onClick={handleCustomClick}
          className={`relative flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden border-2 transition-all ${
            isCustomBackground()
              ? 'border-blue-500 scale-105'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          title="Custom image"
        >
          {isCustomBackground() ? (
            <img 
              src={state.backgroundImageUrl} 
              alt="Custom"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-lg">+</span>
            </div>
          )}
        </button>
      </div>

      {/* Custom URL input (appears when custom is clicked) */}
      {showCustomInput && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCustomSubmit();
              } else if (e.key === 'Escape') {
                setShowCustomInput(false);
              }
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleCustomSubmit}
              disabled={!customUrl.trim()}
              className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
            <button
              onClick={() => setShowCustomInput(false)}
              className="px-3 py-1.5 text-gray-600 text-sm rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 