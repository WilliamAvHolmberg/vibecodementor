'use client';

import { Notification } from '../types';
import { Button } from '@/shared/components/ui/button';
import { SimpleNotificationCard } from './SimpleNotificationCard';

interface NotificationControlsProps {
  notifications: Notification[];
  onAddNotification: (notification: Omit<Notification, 'id'>) => void;
  onUpdateNotification: (id: string, updates: Partial<Notification>) => void;
  onRemoveNotification: (id: string) => void;
}

export function NotificationControls({
  notifications,
  onAddNotification,
  onUpdateNotification,
  onRemoveNotification
}: NotificationControlsProps) {

  const addNotification = () => {
    onAddNotification({
      appName: 'Messages',
      appIcon: '💬',
      message: 'Tap to edit this message',
      timeAgo: 'now'
    });
  };

  return (
    <div className="space-y-4">
      {/* Simple Add Button */}
      <Button
        onClick={addNotification}
        disabled={notifications.length >= 6}
        variant="outline"
        className="w-full"
      >
        + Add Notification
      </Button>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <div className="text-2xl mb-2">📱</div>
            <p className="text-sm">Add a notification to get started</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <SimpleNotificationCard
              key={notification.id}
              notification={notification}
              onUpdate={onUpdateNotification}
              onRemove={onRemoveNotification}
            />
          ))
        )}
      </div>

      {notifications.length >= 6 && (
        <p className="text-xs text-gray-500 text-center">
          Maximum of 6 notifications
        </p>
      )}
    </div>
  );
} 