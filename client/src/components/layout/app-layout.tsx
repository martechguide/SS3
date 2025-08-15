import { ReactNode } from "react";
import { ResponsiveBannerAd } from "@/components/responsive-banner-ad";
import { MobileResponsiveAd } from "@/components/mobile-responsive-ad";

interface AppLayoutProps {
  children: ReactNode;
  pageType?: string;
  showBannerAds?: boolean;
  className?: string;
}

export function AppLayout({ 
  children, 
  pageType = "default", 
  showBannerAds = true,
  className = "" 
}: AppLayoutProps) {
  return (
    <div className={`min-h-screen pb-20 ${className}`}> {/* Extra padding for multiple ads */}
      {/* Main Content */}
      <main className="relative">
        {children}
      </main>
      
      {/* Page-specific banner ads */}
      {showBannerAds && (
        <>
          {/* Primary bottom banner ad */}
          <ResponsiveBannerAd 
            placement={`${pageType}-bottom-primary`}
            pageType={pageType}
            className="z-50"
          />
          
          {/* Secondary banner ad (for high-traffic pages) */}
          {(pageType === 'home' || pageType === 'video' || pageType === 'subject') && (
            <div className="fixed bottom-16 left-0 right-0 z-40">
              <ResponsiveBannerAd 
                placement={`${pageType}-bottom-secondary`}
                pageType={pageType}
                className="bg-gray-100 dark:bg-gray-800"
                dismissible={true}
              />
            </div>
          )}
          
          {/* Mobile-optimized ad */}
          <MobileResponsiveAd 
            placement={`${pageType}-mobile`}
            pageType={pageType}
            position="bottom"
            minimizable={true}
          />
        </>
      )}
    </div>
  );
}