// Fake iPhone Feature Exports

// Pages
export { FakeIPhonePage } from './pages/FakeIPhonePage';

// Components
export { LockScreenPreview } from './components/LockScreenPreview';
export { NotificationCard } from './components/NotificationCard';
export { SimpleNotificationCard } from './components/SimpleNotificationCard';
export { AppIcon } from './components/AppIcon';
export { SystemControls } from './components/SystemControls';
export { NotificationControls } from './components/NotificationControls';
export { DownloadControls } from './components/DownloadControls';
export { BackgroundControls } from './components/BackgroundControls';
export { TabbedControls } from './components/TabbedControls';

// Hooks
export { useLockScreenState } from './hooks/useLockScreenState';
export { useHtmlDownload } from './hooks/useCanvasDownload';

// Types
export type { 
  LockScreenState, 
  Notification, 
  DownloadOptions
} from './types';

// Constants
export { APP_ICONS, QUICK_ICONS } from './constants/app-icons';
export type { AppIconOption } from './constants/app-icons'; 