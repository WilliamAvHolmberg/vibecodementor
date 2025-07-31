'use client';

import { LockScreenState } from '../types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

interface SystemControlsProps {
  state: LockScreenState;
  onUpdateTime: (time: string) => void;
  onUpdateDate: (date: string) => void;
  onUpdateCarrier: (carrier: string) => void;
  onUpdateSignalStrength: (strength: 1 | 2 | 3 | 4) => void;
  onUpdateWifi: (enabled: boolean) => void;
  onUpdateBattery: (level: number) => void;
}

export function SystemControls({
  state,
  onUpdateTime,
  onUpdateDate,
  onUpdateCarrier,
  onUpdateSignalStrength,
  onUpdateWifi,
  onUpdateBattery
}: SystemControlsProps) {

  const setCurrentTime = () => {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5); // HH:MM
    onUpdateTime(timeString);
  };

  const setCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    };
    const dateString = now.toLocaleDateString('en-US', options).toLowerCase();
    onUpdateDate(dateString);
  };

  return (
    <div className="space-y-4">
      {/* Time & Date Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">Time</label>
          <div className="flex gap-1">
            <Input
              value={state.time}
              onChange={(e) => onUpdateTime(e.target.value)}
              placeholder="HH:MM"
              className="text-sm h-8"
            />
            <Button 
              variant="outline" 
              onClick={setCurrentTime}
              size="sm"
              className="h-8 px-2 text-xs"
            >
              Now
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">Date</label>
          <div className="flex gap-1">
            <Input
              value={state.date}
              onChange={(e) => onUpdateDate(e.target.value)}
              placeholder="wednesday 23 july"
              className="text-sm h-8"
            />
            <Button 
              variant="outline" 
              onClick={setCurrentDate}
              size="sm"
              className="h-8 px-2 text-xs"
            >
              Today
            </Button>
          </div>
        </div>
      </div>

      {/* Carrier */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-600">Carrier</label>
        <div className="flex gap-1 mb-2">
          {['Verizon', 'AT&T', 'T-Mobile', 'Custom'].map((carrier) => (
            <Button
              key={carrier}
              variant={
                (carrier === 'Custom' && !['Verizon', 'AT&T', 'T-Mobile'].includes(state.carrier)) ||
                state.carrier === carrier ? 'default' : 'outline'
              }
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => {
                if (carrier !== 'Custom') {
                  onUpdateCarrier(carrier);
                }
              }}
            >
              {carrier}
            </Button>
          ))}
        </div>
        {!['Verizon', 'AT&T', 'T-Mobile'].includes(state.carrier) && (
          <Input
            value={state.carrier}
            onChange={(e) => onUpdateCarrier(e.target.value)}
            placeholder="Custom carrier name"
            className="text-sm h-8"
          />
        )}
      </div>

      {/* Status Bar Settings Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Signal Strength */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">Signal</label>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4].map((strength) => (
              <Button
                key={strength}
                variant={state.signalStrength === strength ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-1.5 text-xs flex-1"
                onClick={() => onUpdateSignalStrength(strength as 1 | 2 | 3 | 4)}
              >
                {strength}
              </Button>
            ))}
          </div>
        </div>

        {/* WiFi */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">WiFi</label>
          <div className="flex gap-0.5">
            <Button
              variant={state.wifiEnabled ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-2 text-xs flex-1"
              onClick={() => onUpdateWifi(true)}
            >
              On
            </Button>
            <Button
              variant={!state.wifiEnabled ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-2 text-xs flex-1"
              onClick={() => onUpdateWifi(false)}
            >
              Off
            </Button>
          </div>
        </div>

        {/* Battery Level */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">
            Battery ({state.batteryLevel}%)
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={state.batteryLevel}
            onChange={(e) => onUpdateBattery(parseInt(e.target.value))}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
} 