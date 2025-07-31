'use client';

import { useState } from 'react';
import { LockScreenState, Notification } from '../types';
import { DeviceTab } from './tabs/DeviceTab';
import { NotificationsTab } from './tabs/NotificationsTab';

interface TabbedControlsProps {
  state: LockScreenState;
  onUpdateTime: (time: string) => void;
  onUpdateDate: (date: string) => void;
  onUpdateCarrier: (carrier: string) => void;
  onUpdateSignalStrength: (strength: 1 | 2 | 3 | 4) => void;
  onUpdateWifi: (enabled: boolean) => void;
  onUpdateBattery: (level: number) => void;
  onUpdateBackground: (type: 'gradient' | 'image', url?: string) => void;
  onAddNotification: (notification: Omit<Notification, 'id'>) => void;
  onUpdateNotification: (id: string, updates: Partial<Notification>) => void;
  onRemoveNotification: (id: string) => void;
}

type TabType = 'device' | 'notifications';

export function TabbedControls({
  state,
  onUpdateTime,
  onUpdateDate,
  onUpdateCarrier,
  onUpdateSignalStrength,
  onUpdateWifi,
  onUpdateBattery,
  onUpdateBackground,
  onAddNotification,
  onUpdateNotification,
  onRemoveNotification
}: TabbedControlsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('device');

  const tabs = [
    { id: 'device' as TabType, label: 'Device' },
    { id: 'notifications' as TabType, label: 'Notifications' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-0">
          {tabs.map((tab) => (
                         <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex-1 px-6 py-3 text-sm font-medium text-center border-b transition-colors ${
                 activeTab === tab.id
                   ? 'border-gray-900 text-gray-900'
                   : 'border-transparent text-gray-500 hover:text-gray-700'
               }`}
             >
               {tab.label}
             </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'device' && (
          <DeviceTab
            state={state}
            onUpdateTime={onUpdateTime}
            onUpdateDate={onUpdateDate}
            onUpdateCarrier={onUpdateCarrier}
            onUpdateSignalStrength={onUpdateSignalStrength}
            onUpdateWifi={onUpdateWifi}
            onUpdateBattery={onUpdateBattery}
            onUpdateBackground={onUpdateBackground}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab
            notifications={state.notifications}
            onAddNotification={onAddNotification}
            onUpdateNotification={onUpdateNotification}
            onRemoveNotification={onRemoveNotification}
          />
        )}
      </div>
    </div>
  );
} 