'use client';

import { forwardRef } from 'react';
import { LockScreenState } from '../types';
import { AppIcon } from './AppIcon';
import { APP_ICONS } from '../constants/app-icons';

interface LockScreenPreviewProps {
    state: LockScreenState;
    includeFrame?: boolean;
    className?: string;
}

export const LockScreenPreview = forwardRef<HTMLDivElement, LockScreenPreviewProps>(({
    state,
    includeFrame = true,
    className = ''
}, ref) => {

    const signalBars = Array.from({ length: 4 }, (_, i) => (
        <div
            key={i}
            className={`w-1 rounded-full ${i < state.signalStrength ? 'bg-white' : 'bg-white/30'
                }`}
            style={{ height: `${4 + i * 2}px` }}
        />
    ));

    const batteryFillWidth = Math.max(2, (state.batteryLevel / 100) * 20);
    const batteryColor = state.batteryLevel > 20
        ? (state.batteryLevel > 50 ? 'bg-green-400' : 'bg-yellow-400')
        : 'bg-red-400';

      return (
    <div ref={ref} className={`relative mx-auto ${className}`} data-download-target>
      {includeFrame ? (
        /* iPhone Frame */
        <div className="relative w-[387px] h-[824px] bg-black rounded-[50px] p-[6px] shadow-2xl">
          {/* Screen */}
          <div className="relative w-[375px] h-[812px] rounded-[40px] overflow-hidden" data-screen-content>
            <ScreenBackground state={state} />
            <LockScreenContent state={state} signalBars={signalBars} batteryFillWidth={batteryFillWidth} batteryColor={batteryColor} />
          </div>
        </div>
      ) : (
        /* Just the screen content */
        <div className="relative w-[375px] h-[812px] rounded-[40px] overflow-hidden" data-screen-content>
          <ScreenBackground state={state} />
          <LockScreenContent state={state} signalBars={signalBars} batteryFillWidth={batteryFillWidth} batteryColor={batteryColor} />
        </div>
      )}
    </div>
  );
});

interface LockScreenContentProps {
    state: LockScreenState;
    signalBars: React.ReactNode;
    batteryFillWidth: number;
    batteryColor: string;
}

function LockScreenContent({ state, signalBars, batteryFillWidth, batteryColor }: LockScreenContentProps) {
    return (
        <>
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center px-6 pt-3 pb-1">
                <div className="flex items-center space-x-3">
                    <div className="text-white text-sm font-semibold">{state.carrier}</div>

                </div>

                <div className="flex items-center space-x-2">
                    {/* Signal Bars */}
                    <div className="flex items-end space-x-0.5">
                        {signalBars}
                    </div>

                    {/* Battery */}
                    <div className="flex items-center">
                        <div className="w-6 h-3 border border-white rounded-sm relative">
                            <div
                                className={`h-1.5 ${batteryColor} rounded-sm absolute top-0.5 left-0.5`}
                                style={{ width: `${batteryFillWidth}px` }}
                            ></div>
                        </div>
                        <div className="w-0.5 h-1.5 bg-white rounded-r ml-0.5"></div>
                    </div>
                </div>
            </div>

            {/* Dynamic Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-8 bg-black rounded-b-3xl z-40"></div>

            {/* Lock Screen Content */}
            <div className="relative z-30 h-full flex flex-col">
                {/* Top spacing */}
                <div className="flex-1"></div>

                {/* Center Clock Section */}
                <div className="text-center text-white px-6">
                    {/* Date */}
                    <div className="mb-4">
                        <span className="text-lg font-medium">{state.date}</span>
                    </div>

                    {/* Main Clock */}
                    <div className="text-8xl font-thin tracking-tight mb-8 leading-none">
                        {state.time}
                    </div>
                </div>

                {/* Bottom notifications area */}
                <div className="flex-1 flex flex-col justify-end pb-16">
                    <div className="px-4 space-y-3">
                        {state.notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="bg-white/20 backdrop-blur-md rounded-2xl p-2.5 shadow-lg border border-white/10 relative"
                            >
                                {/* Time ago - Fixed in top right corner */}
                                <div className="absolute top-1 right-2">
                                    <span className="text-xs text-white/50">
                                        {notification.timeAgo}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2 pr-10">
                                    {/* App Icon - Always centered */}
                                    <div className="flex-shrink-0 shadow-sm">
                                        <AppIcon
                                            src={APP_ICONS.find(icon => icon.id === notification.appIcon)?.filename || 'message.jpg'}
                                            alt={notification.appName}
                                            size="md"
                                            customUrl={notification.appIconUrl}
                                            className="shadow-sm"
                                        />
                                    </div>

                                    {/* Content - Centered but flexible, wider */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <span className="text-xs font-bold text-black truncate mb-0.5">
                                            {notification.appName}
                                        </span>
                                        <p className="text-xs text-black leading-tight">
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/60 rounded-full z-50"></div>
        </>
    );
}

interface ScreenBackgroundProps {
    state: LockScreenState;
}

function ScreenBackground({ state }: ScreenBackgroundProps) {
    if (state.backgroundType === 'image' && state.backgroundImageUrl) {
        return (
            <div className="absolute inset-0">
                {/* Use img element instead of background-image for better CORS handling */}
                <img
                    src={state.backgroundImageUrl}
                    alt="Lock screen background"
                    className="absolute inset-0 w-full h-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                        console.warn('Background image failed to load:', state.backgroundImageUrl);
                        // Fallback to gradient if image fails
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                    }}
                />
                {/* Fallback gradient in case image fails */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500 via-purple-500 to-purple-700" style={{ zIndex: -1 }} />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/20" />
            </div>
        );
    }

    // Default gradient
    return <div className="absolute inset-0 bg-gradient-to-b from-blue-500 via-purple-500 to-purple-700" />;
}

LockScreenPreview.displayName = 'LockScreenPreview';

