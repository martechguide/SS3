import { useState, useEffect } from "react";
import { X, ChevronUp } from "lucide-react";
import { useBannerSettings } from "@/hooks/use-banner-settings";

interface MobileResponsiveAdProps {
  placement?: string;
  position?: 'bottom' | 'top';
  minimizable?: boolean;
  pageType?: string;
}

export function MobileResponsiveAd({ 
  placement = "mobile-banner", 
  position = "bottom",
  minimizable = true,
  pageType = "global"
}: MobileResponsiveAdProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [adContent, setAdContent] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { shouldShowMobileAds, shouldShowOnPage, settings } = useBannerSettings();

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadMobileAdContent();
  }, [placement]);

  const loadMobileAdContent = async () => {
    try {
      const response = await fetch(`/api/brand-promotions/active?placementType=mobile-banner&placement=${placement}`);
      const brandAds = await response.json();
      
      if (brandAds && brandAds.length > 0) {
        const selectedAd = brandAds[Math.floor(Math.random() * brandAds.length)];
        setAdContent({
          type: 'brand',
          data: selectedAd
        });
        
        // Track mobile impression
        trackMobileAdImpression(selectedAd.id);
      } else {
        setAdContent({
          type: 'mobile-optimized',
          data: {
            title: "Get Premium Access",
            description: "Unlock all features",
            ctaText: "Upgrade",
            mobileOptimized: true
          }
        });
      }
    } catch (error) {
      console.error('Failed to load mobile ad:', error);
    }
  };

  const trackMobileAdImpression = async (promotionId: string) => {
    try {
      await fetch('/api/brand-promotions/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promotionId,
          actionType: 'view',
          deviceType: 'mobile',
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Failed to track mobile ad impression:', error);
    }
  };

  const handleAdClick = () => {
    if (adContent?.type === 'brand') {
      trackMobileAdClick(adContent.data.id);
      if (adContent.data.websiteUrl) {
        window.open(adContent.data.websiteUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const trackMobileAdClick = async (promotionId: string) => {
    try {
      await fetch('/api/brand-promotions/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promotionId,
          actionType: 'click',
          deviceType: 'mobile',
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Failed to track mobile ad click:', error);
    }
  };

  // Only show on mobile devices if banner settings allow
  if (!isMobile || !shouldShowMobileAds(pageType) || !isVisible || !adContent) {
    return null;
  }

  const positionClasses = position === 'bottom' 
    ? 'bottom-0' 
    : 'top-0';

  return (
    <div className={`fixed left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg ${positionClasses} transition-transform duration-300 ${isMinimized ? 'transform translate-y-[calc(100%-2rem)]' : ''}`}>
      <div className="relative">
        {/* Minimize/Maximize button */}
        {(minimizable && !!settings.minimizable) && (
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-t-lg px-3 py-1 shadow-sm"
          >
            <ChevronUp className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Ad Content */}
        <div 
          className={`px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${isMinimized ? 'hidden' : 'block'}`}
          onClick={handleAdClick}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {adContent.data.brandLogo && (
                <img 
                  src={adContent.data.brandLogo} 
                  alt={adContent.data.brandName}
                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {adContent.data.productName || adContent.data.title}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
                  {adContent.data.productDescription || adContent.data.description}
                </div>
              </div>
              <button className="flex-shrink-0 px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                {adContent.data.callToAction || adContent.data.ctaText}
              </button>
            </div>
            
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimized state */}
        {isMinimized && (
          <div className="px-3 py-1 text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Ad</div>
          </div>
        )}
        
        {/* Ad label */}
        <div className="absolute top-1 left-2 text-xs text-gray-400 uppercase tracking-wide">
          Ad
        </div>
      </div>
    </div>
  );
}