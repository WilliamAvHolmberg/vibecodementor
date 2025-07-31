'use client';

import { Notification } from '../../types';
import { NotificationControls } from '../NotificationControls';

interface NotificationsTabProps {
  notifications: Notification[];
  onAddNotification: (notification: Omit<Notification, 'id'>) => void;
  onUpdateNotification: (id: string, updates: Partial<Notification>) => void;
  onRemoveNotification: (id: string) => void;
}

export function NotificationsTab({
  notifications,
  onAddNotification,
  onUpdateNotification,
  onRemoveNotification
}: NotificationsTabProps) {
  return (
    <div className="space-y-6">
      <NotificationControls
        notifications={notifications}
        onAddNotification={onAddNotification}
        onUpdateNotification={onUpdateNotification}
        onRemoveNotification={onRemoveNotification}
      />
    </div>
  );
} 