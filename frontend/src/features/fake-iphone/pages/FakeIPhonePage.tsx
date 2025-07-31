'use client';

import { useRef } from 'react';
import { useLockScreenState } from '../hooks/useLockScreenState';
import { LockScreenPreview } from '../components/LockScreenPreview';
import { TabbedControls } from '../components/TabbedControls';
import { DownloadControls } from '../components/DownloadControls';
import { Button } from '@/shared/components/ui/button';

export function FakeIPhonePage() {
  const {
    state,
    updateTime,
    updateDate,
    updateCarrier,
    updateSignalStrength,
    updateWifi,
    updateBattery,
    updateBackground,
    addNotification,
    updateNotification,
    removeNotification,
    resetToDefaults
  } = useLockScreenState();

  const lockScreenRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📱 Fake iPhone Lock Screen Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create realistic iPhone lock screens with custom notifications, time, and system settings. 
            Perfect for demos, mockups, or just having fun!
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Preview */}
          <div className="space-y-6">
            {/* Preview Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Preview</h2>
                <Button
                  variant="outline"
                  onClick={resetToDefaults}
                  size="sm"
                >
                  Reset
                </Button>
              </div>
              
              <LockScreenPreview 
                ref={lockScreenRef}
                state={state}
                includeFrame={true}
                className="mb-6"
              />
            </div>

            {/* Download Section - Always Visible */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <DownloadControls elementRef={lockScreenRef} />
            </div>
          </div>

          {/* Right Side - Tabbed Controls */}
          <div className="space-y-6">
            <TabbedControls
              state={state}
              onUpdateTime={updateTime}
              onUpdateDate={updateDate}
              onUpdateCarrier={updateCarrier}
              onUpdateSignalStrength={updateSignalStrength}
              onUpdateWifi={updateWifi}
              onUpdateBattery={updateBattery}
              onUpdateBackground={updateBackground}
              onAddNotification={addNotification}
              onUpdateNotification={updateNotification}
              onRemoveNotification={removeNotification}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            Made for fun • Not affiliated with Apple Inc. • iPhone is a trademark of Apple Inc.
          </p>
        </div>
      </div>
    </div>
  );
} 