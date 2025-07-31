'use client';

import { useState, useCallback } from 'react';
import { LockScreenState, Notification } from '../types';

const initialState: LockScreenState = {
  time: '22:21',
  date: 'wednesday 23 july',
  carrier: 'carrier',
  signalStrength: 3,
  wifiEnabled: true,
  batteryLevel: 85,
  backgroundType: 'gradient',
  backgroundImageUrl: undefined,
  notifications: [
    {
      id: '1',
      appName: 'Messages',
      appIcon: '💬',
      message: 'Hey! Want to grab coffee later?',
      timeAgo: 'now'
    }
  ]
};

export function useLockScreenState() {
  const [state, setState] = useState<LockScreenState>(initialState);

  const updateTime = useCallback((time: string) => {
    setState(prev => ({ ...prev, time }));
  }, []);

  const updateDate = useCallback((date: string) => {
    setState(prev => ({ ...prev, date }));
  }, []);

  const updateCarrier = useCallback((carrier: string) => {
    setState(prev => ({ ...prev, carrier }));
  }, []);

  const updateSignalStrength = useCallback((signalStrength: 1 | 2 | 3 | 4) => {
    setState(prev => ({ ...prev, signalStrength }));
  }, []);

  const updateWifi = useCallback((wifiEnabled: boolean) => {
    setState(prev => ({ ...prev, wifiEnabled }));
  }, []);

  const updateBattery = useCallback((batteryLevel: number) => {
    setState(prev => ({ ...prev, batteryLevel }));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    setState(prev => ({
      ...prev,
      notifications: [
        ...prev.notifications,
        { ...notification, id: Date.now().toString() }
      ].slice(0, 6) // Max 6 notifications
    }));
  }, []);

  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif =>
        notif.id === id ? { ...notif, ...updates } : notif
      )
    }));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(notif => notif.id !== id)
    }));
  }, []);

  const updateBackground = useCallback((backgroundType: 'gradient' | 'image', backgroundImageUrl?: string) => {
    setState(prev => ({ 
      ...prev, 
      backgroundType,
      backgroundImageUrl: backgroundType === 'image' ? backgroundImageUrl : undefined
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setState(initialState);
  }, []);

  return {
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
  };
} 