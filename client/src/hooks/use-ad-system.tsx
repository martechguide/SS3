import { useState, useEffect, useCallback } from 'react';
import { AdConfig } from '@/components/ads/ad-manager';

// Default ad configurations for the system
export const defaultAdConfigs: AdConfig[] = [
  // AdSense Configurations
  {
    id: 'adsense-header-banner',
    type: 'adsense',
    format: 'banner',
    placement: 'header',
    code: `<ins class="adsbygoogle"
                style="display:block"
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="XXXXXXXXXX"
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>`,
    enabled: true,
    dimensions: { width: 728, height: 90 }
  },
  {
    id: 'adsense-sidebar',
    type: 'adsense',
    format: 'banner',
    placement: 'sidebar',
    code: `<ins class="adsbygoogle"
                style="display:block"
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="XXXXXXXXXX"
                data-ad-format="rectangle"></ins>`,
    enabled: true,
    dimensions: { width: 300, height: 250 }
  },
  {
    id: 'adsense-native',
    type: 'adsense',
    format: 'native',
    placement: 'between-videos',
    code: `<ins class="adsbygoogle"
                style="display:block"
                data-ad-format="fluid"
                data-ad-layout-key="-gw-3+1f-3d+2z"
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="XXXXXXXXXX"></ins>`,
    enabled: true
  },

  // Video Ads - Pre-roll (Before videos)
  {
    id: 'adsterra-video-preroll',
    type: 'adsterra',
    format: 'video',
    placement: 'pre-roll',
    vastTag: 'https://www.videosprofitnetwork.com/watch.xml?key=YOUR_KEY&w=640&h=360&cb=[CACHE_BUSTER]&url=[PAGE_URL]',
    enabled: true,
    skipAfter: 7,
    dimensions: { width: 640, height: 360 }
  },
  {
    id: 'propellerads-video-preroll',
    type: 'propellerads',
    format: 'video',
    placement: 'pre-roll',
    vastTag: 'https://nep.propellerads.com/ag/tags?key=YOUR_PROPELLER_KEY&w=640&h=360',
    enabled: false,
    skipAfter: 7,
    dimensions: { width: 640, height: 360 }
  },
  
  // Video Ads - Between videos (After completing a video)
  {
    id: 'adsterra-video-between',
    type: 'adsterra',
    format: 'video',
    placement: 'between-videos',
    vastTag: 'https://www.videosprofitnetwork.com/watch.xml?key=YOUR_KEY_2&w=640&h=360&cb=[CACHE_BUSTER]&url=[PAGE_URL]',
    enabled: true,
    skipAfter: 7,
    dimensions: { width: 640, height: 360 }
  },
  {
    id: 'propellerads-video-between',
    type: 'propellerads',
    format: 'video',
    placement: 'between-videos',
    vastTag: 'https://nep.propellerads.com/ag/tags?key=YOUR_PROPELLER_KEY_2&w=640&h=360',
    enabled: false,
    skipAfter: 7,
    dimensions: { width: 640, height: 360 }
  },
  {
    id: 'adsterra-popup',
    type: 'adsterra',
    format: 'popup',
    placement: 'pause-overlay',
    code: 'https://a.realsrv.com/ad-provider.js',
    enabled: true,
    dimensions: { width: 400, height: 300 }
  },
  {
    id: 'adsterra-banner',
    type: 'adsterra',
    format: 'banner',
    placement: 'footer',
    code: `<script type="text/javascript">
        atOptions = {
          'key' : 'YOUR_ADSTERRA_KEY',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
        document.write('<scr' + 'ipt type="text/javascript" src="//www.topcreativeformat.com/YOUR_ADSTERRA_KEY/invoke.js"></scr' + 'ipt>');
      </script>`,
    enabled: true,
    dimensions: { width: 728, height: 90 }
  },

  // Promotional Ads
  {
    id: 'promo-course-upgrade',
    type: 'promotional',
    format: 'popup',
    placement: 'pause-overlay',
    title: 'Upgrade to Premium',
    description: 'Get unlimited access to all courses and remove ads!',
    imageUrl: 'https://via.placeholder.com/400x200/3b82f6/ffffff?text=Premium+Course',
    clickUrl: '/pricing',
    enabled: true,
    dimensions: { width: 400, height: 300 }
  },
  {
    id: 'promo-new-course',
    type: 'promotional',
    format: 'native',
    placement: 'native',
    title: 'New Course Available',
    description: 'Learn advanced programming concepts in our latest course series.',
    imageUrl: 'https://via.placeholder.com/300x150/10b981/ffffff?text=New+Course',
    clickUrl: '/courses/new',
    enabled: true
  },
  {
    id: 'promo-sidebar-banner',
    type: 'promotional',
    format: 'banner',
    placement: 'sidebar',
    title: 'Join Our Community',
    description: 'Connect with fellow learners and get help with your studies.',
    imageUrl: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Community',
    clickUrl: '/community',
    enabled: true,
    dimensions: { width: 300, height: 200 }
  }
];

export interface AdSystemState {
  configs: AdConfig[];
  isLoading: boolean;
  error: string | null;
  revenue: {
    daily: number;
    monthly: number;
    total: number;
  };
}

export function useAdSystem() {
  const [adState, setAdState] = useState<AdSystemState>({
    configs: defaultAdConfigs,
    isLoading: false,
    error: null,
    revenue: {
      daily: 0,
      monthly: 0,
      total: 0
    }
  });

  // Load ad configurations from API
  const loadAdConfigs = useCallback(async () => {
    setAdState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/admin/ads');
      if (response.ok) {
        const data = await response.json();
        setAdState(prev => ({
          ...prev,
          configs: data.configs || defaultAdConfigs,
          revenue: data.revenue || prev.revenue,
          isLoading: false
        }));
      } else {
        // Use default configs if API fails
        setAdState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to load ad configs:', error);
      setAdState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to load ad configurations'
      }));
    }
  }, []);

  // Update ad configuration
  const updateAdConfig = useCallback(async (adId: string, updates: Partial<AdConfig>) => {
    setAdState(prev => ({
      ...prev,
      configs: prev.configs.map(config =>
        config.id === adId ? { ...config, ...updates } : config
      )
    }));

    try {
      await fetch(`/api/admin/ads/${adId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('Failed to update ad config:', error);
    }
  }, []);

  // Toggle ad enabled state
  const toggleAd = useCallback((adId: string) => {
    updateAdConfig(adId, { 
      enabled: !adState.configs.find(c => c.id === adId)?.enabled 
    });
  }, [adState.configs, updateAdConfig]);

  // Get ads by placement
  const getAdsByPlacement = useCallback((placement: AdConfig['placement']) => {
    return adState.configs.filter(config => 
      config.placement === placement && config.enabled
    );
  }, [adState.configs]);

  // Track ad impression
  const trackImpression = useCallback(async (adId: string) => {
    try {
      await fetch('/api/admin/ads/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, event: 'impression' })
      });
    } catch (error) {
      console.error('Failed to track impression:', error);
    }
  }, []);

  // Track ad click
  const trackClick = useCallback(async (adId: string) => {
    try {
      await fetch('/api/admin/ads/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, event: 'click' })
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  }, []);

  // Load configs on mount
  useEffect(() => {
    loadAdConfigs();
  }, [loadAdConfigs]);

  return {
    ...adState,
    updateAdConfig,
    toggleAd,
    getAdsByPlacement,
    trackImpression,
    trackClick,
    refresh: loadAdConfigs
  };
}

// Hook for video ads specifically
export function useVideoAds() {
  const { configs, trackImpression, trackClick } = useAdSystem();
  
  const getPreRollAds = useCallback(() => {
    return configs.filter(config => 
      config.format === 'video' && 
      config.placement === 'between-videos' && 
      config.enabled
    );
  }, [configs]);

  const getPauseOverlayAds = useCallback(() => {
    return configs.filter(config => 
      config.placement === 'pause-overlay' && 
      config.enabled
    );
  }, [configs]);

  return {
    preRollAds: getPreRollAds(),
    pauseOverlayAds: getPauseOverlayAds(),
    trackImpression,
    trackClick
  };
}