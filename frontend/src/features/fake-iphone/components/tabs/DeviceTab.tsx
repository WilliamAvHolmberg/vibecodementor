'use client';

import { LockScreenState } from '../../types';
import { SystemControls } from '../SystemControls';
import { BackgroundControls } from '../BackgroundControls';

interface DeviceTabProps {
  state: LockScreenState;
  onUpdateTime: (time: string) => void;
  onUpdateDate: (date: string) => void;
  onUpdateCarrier: (carrier: string) => void;
  onUpdateSignalStrength: (strength: 1 | 2 | 3 | 4) => void;
  onUpdateWifi: (enabled: boolean) => void;
  onUpdateBattery: (level: number) => void;
  onUpdateBackground: (type: 'gradient' | 'image', url?: string) => void;
}

export function DeviceTab({
  state,
  onUpdateTime,
  onUpdateDate,
  onUpdateCarrier,
  onUpdateSignalStrength,
  onUpdateWifi,
  onUpdateBattery,
  onUpdateBackground
}: DeviceTabProps) {
  return (
    <div className="space-y-5">
      <BackgroundControls
        state={state}
        onUpdateBackground={onUpdateBackground}
      />
      
      <div className="border-t border-gray-100 pt-4">
        <SystemControls
          state={state}
          onUpdateTime={onUpdateTime}
          onUpdateDate={onUpdateDate}
          onUpdateCarrier={onUpdateCarrier}
          onUpdateSignalStrength={onUpdateSignalStrength}
          onUpdateWifi={onUpdateWifi}
          onUpdateBattery={onUpdateBattery}
        />
      </div>
    </div>
  );
} 