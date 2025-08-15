import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, ExternalLink, Play } from "lucide-react";
import AdManager, { AdConfig } from './ad-manager';

interface PauseOverlayAdProps {
  isVisible: boolean;
  onClose: () => void;
  onResume: () => void;
  adConfigs: AdConfig[];
}

export default function PauseOverlayAd({ 
  isVisible, 
  onClose, 
  onResume, 
  adConfigs 
}: PauseOverlayAdProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [showAd, setShowAd] = useState(false);

  const pauseAds = adConfigs.filter(ad => 
    ad.placement === 'pause-overlay' && ad.enabled
  );

  useEffect(() => {
    if (isVisible && pauseAds.length > 0) {
      // Show ad after a brief delay when video is paused
      const timer = setTimeout(() => {
        setShowAd(true);
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    } else {
      setShowAd(false);
    }
  }, [isVisible, pauseAds.length]);

  const handleAdClose = () => {
    setShowAd(false);
    onClose();
  };

  const handleResumeVideo = () => {
    setShowAd(false);
    onResume();
  };

  const handleNextAd = () => {
    if (currentAdIndex < pauseAds.length - 1) {
      setCurrentAdIndex(currentAdIndex + 1);
    } else {
      setCurrentAdIndex(0);
    }
  };

  if (!isVisible || !showAd || pauseAds.length === 0) {
    return null;
  }

  const currentAd = pauseAds[currentAdIndex];

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-[1500]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Video Paused
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResumeVideo}
              className="p-2"
              title="Resume Video"
            >
              <Play className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAdClose}
              className="p-2"
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Ad Content */}
        <div className="p-6">
          {currentAd.type === 'promotional' ? (
            <PromotionalPauseAd 
              ad={currentAd} 
              onAction={handleAdClose}
            />
          ) : currentAd.type === 'adsense' ? (
            <AdSensePauseAd 
              ad={currentAd} 
              onLoad={() => {}}
            />
          ) : currentAd.type === 'adsterra' ? (
            <AdsterraPauseAd 
              ad={currentAd} 
              onLoad={() => {}}
            />
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResumeVideo}
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Resume Video</span>
            </Button>
            
            {pauseAds.length > 1 && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {currentAdIndex + 1} of {pauseAds.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextAd}
                  className="text-xs"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Promotional Ad Component
interface PromotionalPauseAdProps {
  ad: AdConfig;
  onAction: () => void;
}

function PromotionalPauseAd({ ad, onAction }: PromotionalPauseAdProps) {
  const handleClick = () => {
    if (ad.clickUrl) {
      window.open(ad.clickUrl, '_blank');
    }
    onAction();
  };

  return (
    <div className="text-center">
      {ad.imageUrl && (
        <img 
          src={ad.imageUrl} 
          alt={ad.title}
          className="w-full h-32 object-cover rounded-lg mb-4"
        />
      )}
      
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
        {ad.title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
        {ad.description}
      </p>
      
      <Button 
        onClick={handleClick}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        Learn More
      </Button>
      
      <p className="text-xs text-gray-400 mt-2">Sponsored Content</p>
    </div>
  );
}

// AdSense Pause Ad Component
interface AdSensePauseAdProps {
  ad: AdConfig;
  onLoad: () => void;
}

function AdSensePauseAd({ ad, onLoad }: AdSensePauseAdProps) {
  useEffect(() => {
    // Load AdSense script if not already loaded
    if (!document.querySelector('script[src*="adsbygoogle"]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.crossOrigin = 'anonymous';
      script.onload = onLoad;
      document.head.appendChild(script);
    } else {
      onLoad();
    }
  }, [onLoad]);

  return (
    <div className="text-center">
      <p className="text-xs text-gray-400 mb-2">Advertisement</p>
      <div 
        dangerouslySetInnerHTML={{ __html: ad.code || '' }}
        className="adsense-container"
      />
      <p className="text-xs text-gray-400 mt-2">Powered by Google</p>
    </div>
  );
}

// Adsterra Pause Ad Component
interface AdsterraPauseAdProps {
  ad: AdConfig;
  onLoad: () => void;
}

function AdsterraPauseAd({ ad, onLoad }: AdsterraPauseAdProps) {
  useEffect(() => {
    // Load Adsterra script
    if (ad.code) {
      const script = document.createElement('script');
      script.async = true;
      script.src = ad.code;
      script.onload = onLoad;
      document.head.appendChild(script);
    }
  }, [ad.code, onLoad]);

  return (
    <div className="text-center">
      <p className="text-xs text-gray-400 mb-2">Advertisement</p>
      <div className="adsterra-container min-h-[120px] bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
        <span className="text-gray-500">Loading ad...</span>
      </div>
      <p className="text-xs text-gray-400 mt-2">Powered by Adsterra</p>
    </div>
  );
}