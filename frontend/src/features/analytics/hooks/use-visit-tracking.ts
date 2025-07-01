import { useEffect } from 'react';

const VISITOR_ID_KEY = 'visitor_id';

function generateVisitorId(): string {
  return crypto.randomUUID();
}

function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  
  if (!visitorId) {
    visitorId = generateVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  
  return visitorId;
}

async function registerVisit(visitorId: string, path: string): Promise<void> {
  try {
    const response = await fetch('/api/analytics/visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitorId,
        path
      })
    });

    if (!response.ok) {
      console.warn('Failed to register visit:', response.statusText);
    }
  } catch (error) {
    console.warn('Error registering visit:', error);
  }
}

export function useVisitTracking() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    const visitorId = getOrCreateVisitorId();
    const currentPath = window.location.pathname;
    
    // Register visit immediately
    registerVisit(visitorId, currentPath);
  }, []); // Only run once on mount

  return {
    visitorId: typeof window !== 'undefined' ? getOrCreateVisitorId() : '',
    registerVisit: (path?: string) => {
      const visitorId = getOrCreateVisitorId();
      const targetPath = path || window.location.pathname;
      return registerVisit(visitorId, targetPath);
    }
  };
} 