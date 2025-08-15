import React from 'react';
import AdManager, { AdConfig } from './ad-manager';

interface AdPlacementsProps {
  placement: 'header' | 'sidebar' | 'footer' | 'between-videos' | 'native';
  adConfigs: AdConfig[];
  className?: string;
}

export default function AdPlacements({ placement, adConfigs, className = "" }: AdPlacementsProps) {
  const relevantAds = adConfigs.filter(ad => 
    ad.placement === placement && ad.enabled
  );

  if (relevantAds.length === 0) {
    return null;
  }

  return (
    <div className={`ad-placement ad-placement-${placement} ${className}`}>
      {relevantAds.map((ad, index) => (
        <AdManager 
          key={`${ad.id}-${index}`}
          config={ad}
          className={getPlacementStyles(placement, ad.format)}
        />
      ))}
    </div>
  );
}

function getPlacementStyles(placement: string, format: string): string {
  const baseStyles = "ad-unit";
  
  switch (placement) {
    case 'header':
      return `${baseStyles} mb-4`;
    
    case 'sidebar':
      return `${baseStyles} sticky top-4`;
    
    case 'footer':
      return `${baseStyles} mt-4 border-t pt-4`;
    
    case 'between-videos':
      return `${baseStyles} my-6 border border-gray-200 dark:border-gray-700 rounded-lg`;
    
    case 'native':
      return `${baseStyles} mb-4`;
    
    default:
      return baseStyles;
  }
}

// Specific placement components for better organization
export function HeaderAds({ adConfigs }: { adConfigs: AdConfig[] }) {
  return (
    <AdPlacements 
      placement="header" 
      adConfigs={adConfigs}
      className="header-ads-container"
    />
  );
}

export function SidebarAds({ adConfigs }: { adConfigs: AdConfig[] }) {
  return (
    <div className="sidebar-ads-container space-y-4">
      <AdPlacements 
        placement="sidebar" 
        adConfigs={adConfigs}
      />
    </div>
  );
}

export function FooterAds({ adConfigs }: { adConfigs: AdConfig[] }) {
  return (
    <AdPlacements 
      placement="footer" 
      adConfigs={adConfigs}
      className="footer-ads-container"
    />
  );
}

export function BetweenVideosAds({ adConfigs }: { adConfigs: AdConfig[] }) {
  return (
    <AdPlacements 
      placement="between-videos" 
      adConfigs={adConfigs}
      className="between-videos-ads-container"
    />
  );
}

export function NativeAds({ adConfigs }: { adConfigs: AdConfig[] }) {
  return (
    <AdPlacements 
      placement="native" 
      adConfigs={adConfigs}
      className="native-ads-container"
    />
  );
}