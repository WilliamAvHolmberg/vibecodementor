'use client';

import { useState } from 'react';
import { Notification } from '../types';
import { AppIcon } from './AppIcon';
import { QUICK_ICONS, APP_ICONS, AppIconOption } from '../constants/app-icons';

interface SimpleNotificationCardProps {
  notification: Notification;
  onUpdate: (id: string, updates: Partial<Notification>) => void;
  onRemove: (id: string) => void;
}

export function SimpleNotificationCard({ notification, onUpdate, onRemove }: SimpleNotificationCardProps) {
  const [editingField, setEditingField] = useState<string | null>(null);

  const handleIconClick = (icon: AppIconOption) => {
    onUpdate(notification.id, {
      appIcon: icon.id,
      appName: icon.name,
      appIconUrl: undefined // Clear custom URL when selecting predefined icon
    });
  };

  const handleFieldUpdate = (field: string, value: string) => {
    onUpdate(notification.id, { [field]: value });
    setEditingField(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: string, value: string) => {
    if (e.key === 'Enter') {
      handleFieldUpdate(field, value);
    } else if (e.key === 'Escape') {
      setEditingField(null);
    }
  };

  const currentIcon = APP_ICONS.find(icon => icon.id === notification.appIcon);

  return (
    <div className="group border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors bg-white">
      <div className="flex items-start space-x-3">
        {/* App Icon - Custom image or predefined */}
        <div className="relative">
          <AppIcon
            src={currentIcon?.filename || 'message.jpg'}
            alt={notification.appName}
            size="lg"
            customUrl={notification.appIconUrl}
          />
          
          {/* Icon options on hover */}
          <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-10">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-48">
              {/* Custom Image URL */}
              <div className="mb-3">
                <input
                  type="url"
                  placeholder="Custom icon URL (optional)"
                  defaultValue={notification.appIconUrl || ''}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                  onBlur={(e) => {
                    const url = e.target.value.trim();
                    onUpdate(notification.id, { appIconUrl: url || undefined });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const url = e.currentTarget.value.trim();
                      onUpdate(notification.id, { appIconUrl: url || undefined });
                      setEditingField(null);
                    }
                  }}
                />
              </div>
              
              {/* Quick predefined icons */}
              <div className="grid grid-cols-4 gap-1">
                {QUICK_ICONS.map((icon) => (
                  <button
                    key={icon.id}
                    className={`p-1 rounded hover:bg-gray-50 ${
                      notification.appIcon === icon.id && !notification.appIconUrl ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleIconClick(icon)}
                    title={icon.name}
                  >
                    <AppIcon
                      src={icon.filename}
                      alt={icon.name}
                      size="sm"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* App Name & Time Row */}
          <div className="flex items-center justify-between">
            {editingField === 'appName' ? (
              <input
                type="text"
                defaultValue={notification.appName}
                className="font-medium text-sm bg-transparent border-none outline-none flex-1"
                onBlur={(e) => handleFieldUpdate('appName', e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, 'appName', e.currentTarget.value)}
                autoFocus
              />
            ) : (
              <button
                className="font-medium text-sm text-left hover:text-blue-600 transition-colors"
                onClick={() => setEditingField('appName')}
              >
                {notification.appName}
              </button>
            )}
            
            {editingField === 'timeAgo' ? (
              <input
                type="text"
                defaultValue={notification.timeAgo}
                className="text-xs text-gray-500 bg-transparent border-none outline-none text-right"
                onBlur={(e) => handleFieldUpdate('timeAgo', e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, 'timeAgo', e.currentTarget.value)}
                autoFocus
              />
            ) : (
              <button
                className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
                onClick={() => setEditingField('timeAgo')}
              >
                {notification.timeAgo}
              </button>
            )}
          </div>
          
          {/* Message */}
          {editingField === 'message' ? (
            <textarea
              defaultValue={notification.message}
              className="text-sm text-gray-700 bg-transparent border-none outline-none w-full resize-none"
              rows={2}
              onBlur={(e) => handleFieldUpdate('message', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleFieldUpdate('message', e.currentTarget.value);
                } else if (e.key === 'Escape') {
                  setEditingField(null);
                }
              }}
              autoFocus
            />
          ) : (
            <button
              className="text-sm text-gray-700 leading-relaxed text-left w-full hover:text-blue-600 transition-colors"
              onClick={() => setEditingField('message')}
            >
              {notification.message}
            </button>
          )}
        </div>

        {/* Remove button - subtle, appears on hover */}
        <button
          onClick={() => onRemove(notification.id)}
          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 text-red-500 text-xs flex items-center justify-center transition-all"
          title="Remove notification"
        >
          ×
        </button>
      </div>
    </div>
  );
} 