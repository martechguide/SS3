import React from 'react';
import { Button } from "@/components/ui/button";
import { Grid3X3, List, Grid2X2, LayoutGrid } from "lucide-react";

export type ViewMode = 'grid-small' | 'grid-medium' | 'grid-large' | 'list';

interface GridViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export default function GridViewToggle({ viewMode, onViewModeChange, className = "" }: GridViewToggleProps) {
  return (
    <div className={`flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 ${className}`}>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="p-2 h-8 w-8"
        title="List View"
      >
        <List className="h-4 w-4" />
      </Button>
      
      <Button
        variant={viewMode === 'grid-large' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid-large')}
        className="p-2 h-8 w-8"
        title="Large Grid (2 columns)"
      >
        <Grid2X2 className="h-4 w-4" />
      </Button>
      
      <Button
        variant={viewMode === 'grid-medium' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid-medium')}
        className="p-2 h-8 w-8"
        title="Medium Grid (3 columns)"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      
      <Button
        variant={viewMode === 'grid-small' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid-small')}
        className="p-2 h-8 w-8"
        title="Small Grid (4+ columns)"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function getGridClassName(viewMode: ViewMode): string {
  switch (viewMode) {
    case 'list':
      return 'grid grid-cols-1 gap-4';
    case 'grid-large':
      return 'grid grid-cols-1 md:grid-cols-2 gap-6';
    case 'grid-medium':
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    case 'grid-small':
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4';
    default:
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
  }
}