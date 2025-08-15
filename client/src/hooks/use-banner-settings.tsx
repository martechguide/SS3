import { useQuery } from "@tanstack/react-query";
import type { BannerAdSettings } from "@shared/schema";

export function useBannerSettings() {
  const { data: settings, isLoading, error } = useQuery<BannerAdSettings>({
    queryKey: ["/api/admin/banner-ads"],
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in TanStack Query v5)
  });

  // Default settings if none exist or failed to load
  const defaultSettings: BannerAdSettings = {
    id: "default",
    enabled: true,
    globalEnabled: true,
    homePageEnabled: true,
    videoPageEnabled: true,
    subjectPageEnabled: true,
    mobileEnabled: true,
    placement: "bottom",
    dismissible: true,
    showCloseButton: true,
    minimizable: true,
    autoHide: false,
    autoHideDelay: 30,
    maxImpressions: 1000,
    adNetwork: "mixed",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const bannerSettings = settings || defaultSettings;

  // Helper functions to check if ads should be shown
  const shouldShowAds = () => {
    return !!bannerSettings.enabled && !!bannerSettings.globalEnabled;
  };

  const shouldShowOnPage = (pageType: string) => {
    if (!shouldShowAds()) return false;
    
    // Extract actual page type from URL if pageType is 'global'
    const currentPath = window.location.pathname;
    let actualPageType = pageType;
    
    if (pageType === 'global' || pageType === 'default') {
      if (currentPath === '/') {
        actualPageType = 'home';
      } else if (currentPath.includes('/video/') || currentPath.includes('/multi-video/')) {
        actualPageType = 'video';
      } else if (currentPath.includes('/subject/') || currentPath.includes('/batch/') && currentPath.includes('/subject/')) {
        actualPageType = 'subject';
      }
    }
    
    switch (actualPageType) {
      case 'home':
        return !!bannerSettings.homePageEnabled;
      case 'video':
        return !!bannerSettings.videoPageEnabled;
      case 'subject':
        return !!bannerSettings.subjectPageEnabled;
      default:
        return !!bannerSettings.globalEnabled;
    }
  };

  const shouldShowMobileAds = (pageType: string = 'global') => {
    const canShowOnPage = shouldShowOnPage(pageType);
    const mobileEnabled = !!bannerSettings.mobileEnabled;
    return canShowOnPage && mobileEnabled;
  };

  return {
    settings: bannerSettings,
    isLoading,
    error,
    shouldShowAds,
    shouldShowOnPage,
    shouldShowMobileAds,
  };
}