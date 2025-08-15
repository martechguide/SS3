import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { X, Play, ExternalLink } from "lucide-react";

export interface AdConfig {
  id: string;
  type: 'adsense' | 'adsterra' | 'promotional';
  format: 'banner' | 'video' | 'popup' | 'native';
  placement: 'header' | 'sidebar' | 'between-videos' | 'pause-overlay' | 'footer' | 'native';
  code?: string;
  vastTag?: string;
  imageUrl?: string;
  clickUrl?: string;
  title?: string;
  description?: string;
  enabled: boolean;
  dimensions?: {
    width: number;
    height: number;
  };
}

interface AdManagerProps {
  config: AdConfig;
  onAdClick?: () => void;
  onAdClose?: () => void;
  className?: string;
}

export function AdManager({ config, onAdClick, onAdClose, className = "" }: AdManagerProps) {
  const [isVisible, setIsVisible] = useState(config.enabled);
  const [isLoading, setIsLoading] = useState(true);
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!config.enabled) {
      setIsVisible(false);
      return;
    }

    // Load ad content based on type
    if (config.type === 'adsense') {
      loadAdSenseAd();
    } else if (config.type === 'adsterra') {
      loadAdsterraAd();
    } else if (config.type === 'promotional') {
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      // Clean up any DOM manipulations safely
      if (adRef.current) {
        try {
          while (adRef.current.firstChild) {
            adRef.current.removeChild(adRef.current.firstChild);
          }
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [config]);

  const loadAdSenseAd = () => {
    if (!config.code || !adRef.current) {
      setIsLoading(false);
      return;
    }
    
    try {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        try {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setIsLoading(false);
        } catch (e) {
          console.error('AdSense loading error:', e);
          setIsLoading(false);
        }
      };
      
      script.onerror = () => {
        console.error('Failed to load AdSense script');
        setIsLoading(false);
      };
      
      if (!document.querySelector('script[src*="adsbygoogle"]')) {
        document.head.appendChild(script);
      }
      
      // Create ad unit safely
      const adDiv = document.createElement('div');
      adDiv.innerHTML = config.code;
      adRef.current.appendChild(adDiv);
      
    } catch (error) {
      console.error('AdSense setup error:', error);
      setIsLoading(false);
    }
  };

  const loadAdsterraAd = () => {
    try {
      if (config.code && adRef.current) {
        const script = document.createElement('script');
        script.async = true;
        script.src = config.code;
        
        script.onload = () => {
          setIsLoading(false);
        };
        
        script.onerror = () => {
          console.error('Adsterra loading error');
          setIsLoading(false);
        };
        
        if (!document.querySelector(`script[src="${config.code}"]`)) {
          document.head.appendChild(script);
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Adsterra setup error:', error);
      setIsLoading(false);
    }
  };

  const handleAdClick = () => {
    if (config.clickUrl) {
      window.open(config.clickUrl, '_blank');
    }
    onAdClick?.();
  };

  const handleClose = () => {
    setIsVisible(false);
    onAdClose?.();
  };

  if (!isVisible) return null;

  // Render based on ad format
  switch (config.format) {
    case 'popup':
      return (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] ${className}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute top-2 right-2 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
            
            {config.type === 'promotional' ? (
              <div className="text-center">
                {config.imageUrl && (
                  <img 
                    src={config.imageUrl} 
                    alt={config.title}
                    className="w-full h-32 object-cover rounded mb-4"
                  />
                )}
                <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{config.description}</p>
                <Button onClick={handleAdClick} className="w-full">
                  Learn More <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div ref={adRef} className="text-center">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-32 rounded" />
                ) : null}
              </div>
            )}
          </div>
        </div>
      );

    case 'banner':
      return (
        <div className={`ad-container ${className}`}>
          {config.type === 'promotional' ? (
            <div 
              className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={handleAdClick}
            >
              <div className="flex items-center space-x-4">
                {config.imageUrl && (
                  <img 
                    src={config.imageUrl} 
                    alt={config.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{config.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{config.description}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ) : (
            <div ref={adRef}>
              {isLoading && (
                <div className="animate-pulse bg-gray-200 h-24 rounded" />
              )}
            </div>
          )}
        </div>
      );

    case 'video':
      return (
        <div className={`video-ad-container ${className}`}>
          <div className="relative bg-black rounded-lg overflow-hidden">
            {config.vastTag ? (
              <div className="w-full h-48 bg-gray-900 rounded flex items-center justify-center">
                <div className="text-white text-center">
                  <Play className="h-12 w-12 mx-auto mb-2" />
                  <p>Video Ad Loading...</p>
                </div>
              </div>
            ) : (
              <div ref={adRef} className="w-full h-48">
                {isLoading && (
                  <div className="animate-pulse bg-gray-200 h-full rounded flex items-center justify-center">
                    <Play className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );

    case 'native':
      return (
        <div className={`native-ad ${className}`}>
          {config.type === 'promotional' ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <ExternalLink className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide">Sponsored</p>
                  <h4 className="font-medium text-gray-900 dark:text-white">{config.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{config.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAdClick}
                    className="mt-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div ref={adRef}>
              {isLoading && (
                <div className="animate-pulse bg-gray-200 h-20 rounded" />
              )}
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}

export default AdManager;