export interface AppIconOption {
  id: string;
  name: string;
  filename: string; // Just the filename, not the full path
}

export const APP_ICONS: AppIconOption[] = [
  { id: 'messages', name: 'Messages', filename: 'message.jpg' },
  { id: 'x', name: 'X', filename: 'x.svg' },
  { id: 'cnn', name: 'CNN', filename: 'cnn.png' },
];

// Quick icons for the simplified interface
export const QUICK_ICONS = APP_ICONS.slice(0, 8); // First 8 icons 