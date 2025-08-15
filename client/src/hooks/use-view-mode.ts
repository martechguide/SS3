import { useState, useEffect } from 'react';
import type { ViewMode } from '@/components/grid-view-toggle';

export function useViewMode(storageKey: string, defaultMode: ViewMode = 'grid-medium') {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Get from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved && ['grid-small', 'grid-medium', 'grid-large', 'list'].includes(saved)) {
        return saved as ViewMode;
      }
    }
    return defaultMode;
  });

  // Save to localStorage when view mode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, viewMode);
    }
  }, [viewMode, storageKey]);

  return [viewMode, setViewMode] as const;
}