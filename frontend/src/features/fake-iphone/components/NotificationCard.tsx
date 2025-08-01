'use client';

import { useState } from 'react';
import { Notification } from '../types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { AppIcon } from './AppIcon';
import { APP_ICONS, AppIconOption } from '../constants/app-icons';

interface NotificationCardProps {
  notification: Notification;
  onUpdate: (id: string, updates: Partial<Notification>) => void;
  onRemove: (id: string) => void;
}

export function NotificationCard({ notification, onUpdate, onRemove }: NotificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAppIconSelect = (icon: AppIconOption) => {
    onUpdate(notification.id, {
      appIcon: icon.id,
      appName: icon.name,
      appIconUrl: undefined // Clear custom URL when selecting predefined icon
    });
  };

  const currentIcon = APP_ICONS.find(icon => icon.id === notification.appIcon);

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AppIcon
            src={currentIcon?.filename || 'message.jpg'}
            alt={notification.appName}
            size="sm"
            customUrl={notification.appIconUrl}
          />
          <span className="font-medium">{notification.appName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '−' : '+'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemove(notification.id)}
          >
            ×
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-gray-100">
          {/* Custom Image URL */}
          <div>
            <label className="block text-sm font-medium mb-1">Custom Icon URL</label>
            <Input
              value={notification.appIconUrl || ''}
              onChange={(e) => onUpdate(notification.id, { appIconUrl: e.target.value || undefined })}
              placeholder="https://example.com/icon.png (optional)"
            />
          </div>

          {/* App Icon Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Predefined Icons</label>
            <div className="grid grid-cols-5 gap-2">
              {APP_ICONS.map((icon) => (
                <button
                  key={icon.id}
                  className={`p-2 rounded border text-center hover:bg-gray-50 transition-colors ${
                    notification.appIcon === icon.id && !notification.appIconUrl
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleAppIconSelect(icon)}
                  title={icon.name}
                >
                  <AppIcon
                    src={icon.filename}
                    alt={icon.name}
                    size="sm"
                    className="mx-auto mb-1"
                  />
                  <div className="text-xs text-gray-600 truncate">{icon.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom App Name */}
          <div>
            <label className="block text-sm font-medium mb-1">App Name</label>
            <Input
              value={notification.appName}
              onChange={(e) => onUpdate(notification.id, { appName: e.target.value })}
              placeholder="Custom app name"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={notification.message}
              onChange={(e) => onUpdate(notification.id, { message: e.target.value })}
              placeholder="Notification message..."
            />
          </div>

          {/* Time Ago */}
          <div>
            <label className="block text-sm font-medium mb-1">Time Ago</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {['now', '2 min ago', '1 hour ago'].map((time) => (
                <Button
                  key={time}
                  variant={notification.timeAgo === time ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdate(notification.id, { timeAgo: time })}
                >
                  {time}
                </Button>
              ))}
            </div>
            <Input
              value={notification.timeAgo}
              onChange={(e) => onUpdate(notification.id, { timeAgo: e.target.value })}
              placeholder="Custom time (e.g., '5 min ago')"
            />
          </div>
        </div>
      )}

      {/* Preview when collapsed */}
      {!isExpanded && (
        <div className="text-sm text-gray-600 truncate">
          "{notification.message}" - {notification.timeAgo}
        </div>
      )}
    </div>
  );
} 