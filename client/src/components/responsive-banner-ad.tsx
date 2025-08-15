import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useBannerSettings } from "@/hooks/use-banner-settings";

interface ResponsiveBannerAdProps {
  placement?: string;
  className?: string;
  dismissible?: boolean;
  pageType?: string;
}

export function ResponsiveBannerAd({ 
  placement = "bottom-banner", 
  className = "",
  dismissible = true,
  pageType = "global"
}: ResponsiveBannerAdProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [adContent, setAdContent] = useState<any>(null);
  const { shouldShowAds, shouldShowOnPage, settings } = useBannerSettings();

  useEffect(() => {
    // Load ad content based on placement
    loadAdContent();
  }, [placement]);

  const loadAdContent = async () => {
    try {
      // Try to load brand promotions first
      const response = await fetch(`/api/brand-promotions/active?placementType=banner&placement=${placement}`);
      const brandAds = await response.json();
      
      if (brandAds && brandAds.length > 0) {
        // Use brand promotion ad
        const selectedAd = brandAds[Math.floor(Math.random() * brandAds.length)];
        setAdContent({
          type: 'brand',
          data: selectedAd
        });
        
        // Track impression
        trackAdImpression(selectedAd.id);
      } else {
        // Fallback to programmatic ads
        setAdContent({
          type: 'programmatic',
          data: {
            title: "Premium Educational Content",
            description: "Unlock advanced features with our premium subscription",
            ctaText: "Upgrade Now",
            image: "https://via.placeholder.com/320x100/4F46E5/FFFFFF?text=Premium+Features"
          }
        });
      }
    } catch (error) {
      console.error('Failed to load ad content:', error);
      // Show fallback ad
      setAdContent({
        type: 'fallback',
        data: {
          title: "Support Our Platform",
          description: "Help us keep providing quality education content",
          ctaText: "Learn More",
          image: "https://via.placeholder.com/320x100/10B981/FFFFFF?text=Support+Education"
        }
      });
    }
  };

  const trackAdImpression = async (promotionId: string) => {
    try {
      await fetch('/api/brand-promotions/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promotionId,
          actionType: 'view',
          deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Failed to track ad impression:', error);
    }
  };

  const trackAdClick = async (promotionId?: string) => {
    if (promotionId) {
      try {
        await fetch('/api/brand-promotions/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promotionId,
            actionType: 'click',
            deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
            userAgent: navigator.userAgent
          })
        });
      } catch (error) {
        console.error('Failed to track ad click:', error);
      }
    }
  };

  const handleAdClick = () => {
    if (adContent?.type === 'brand') {
      trackAdClick(adContent.data.id);
      if (adContent.data.websiteUrl) {
        window.open(adContent.data.websiteUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  // Check banner settings before rendering
  if (!shouldShowAds() || !shouldShowOnPage(pageType) || !isVisible || !adContent) {
    return null;
  }

  const renderBrandAd = (brandData: any) => (
    <div 
      className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      onClick={handleAdClick}
    >
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
        {brandData.brandLogo && (
          <img 
            src={brandData.brandLogo} 
            alt={brandData.brandName}
            className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
            {brandData.productName}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {brandData.productDescription || `Discover ${brandData.brandName}'s latest offerings`}
          </div>
        </div>
        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
            {brandData.callToAction || "Learn More"}
          </span>
        </div>
      </div>
    </div>
  );

  const renderProgrammaticAd = (adData: any) => (
    <div className="flex items-center justify-between p-3 sm:p-4">
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
        <img 
          src={adData.image} 
          alt={adData.title}
          className="w-12 h-8 sm:w-16 sm:h-10 rounded object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
            {adData.title}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
            {adData.description}
          </div>
        </div>
        <button className="flex-shrink-0 px-3 py-1 text-xs font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
          {adData.ctaText}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg ${className}`}>
      <div className="max-w-7xl mx-auto relative">
        {/* Ad Content */}
        {adContent.type === 'brand' && renderBrandAd(adContent.data)}
        {(adContent.type === 'programmatic' || adContent.type === 'fallback') && renderProgrammaticAd(adContent.data)}
        
        {/* Dismiss Button */}
        {(dismissible && !!settings.dismissible && !!settings.showCloseButton) && (
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close ad"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {/* Ad Label */}
        <div className="absolute top-1 left-2 text-xs text-gray-400 uppercase tracking-wide">
          Ad
        </div>
      </div>
    </div>
  );
}