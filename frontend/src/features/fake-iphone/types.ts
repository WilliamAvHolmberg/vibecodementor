export interface Notification {
  id: string;
  appName: string;
  appIcon: string; // app icon ID from constants
  appIconUrl?: string; // optional custom image URL
  message: string;
  timeAgo: string; // e.g., "2 min sedan", "nu"
}

export interface LockScreenState {
  // Time and date
  time: string; // HH:MM format
  date: string; // e.g., "onsdag 23 juli"
  
  // System UI
  carrier: string; // e.g., "halebop"
  signalStrength: 1 | 2 | 3 | 4; // bars
  wifiEnabled: boolean;
  batteryLevel: number; // 1-100
  
  // Background
  backgroundType: 'gradient' | 'image';
  backgroundImageUrl?: string;
  
  // Notifications
  notifications: Notification[];
}

export interface DownloadOptions {
  includeFrame: boolean;
  quality: number; // 0.1 to 1.0
}

 