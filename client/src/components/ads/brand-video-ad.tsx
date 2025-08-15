import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ExternalLink, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { BrandPromotion } from "@shared/schema";

interface BrandVideoAdProps {
  placementType: "pre-roll" | "mid-roll" | "post-roll" | "between-videos";
  videoId?: string;
  subjectId?: string;
  batchId?: string;
  onSkip?: () => void;
  onComplete?: () => void;
  className?: string;
}

export function BrandVideoAd({ 
  placementType, 
  videoId, 
  subjectId, 
  batchId, 
  onSkip, 
  onComplete,
  className = ""
}: BrandVideoAdProps) {
  const [promotion, setPromotion] = useState<BrandPromotion | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(7);
  const [canSkip, setCanSkip] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  // Fetch active brand promotion
  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const params = new URLSearchParams();
        params.append("placementType", placementType);
        if (videoId) params.append("videoId", videoId);
        if (subjectId) params.append("subjectId", subjectId);
        if (batchId) params.append("batchId", batchId);

        const response = await fetch(`/api/brand-promotions/active?${params.toString()}`, {
          headers: { "Content-Type": "application/json" }
        });
        const promotions = await response.json();
        if (promotions && promotions.length > 0) {
          // Get the highest priority promotion
          const selectedPromotion = promotions.sort((a: BrandPromotion, b: BrandPromotion) => 
            (b.priority || 1) - (a.priority || 1)
          )[0];
          
          setPromotion(selectedPromotion);
          setIsVisible(true);
          
          // Track impression
          await trackAnalytics(selectedPromotion.id, "view");
        }
      } catch (error) {
        console.error("Error fetching brand promotion:", error);
      }
    };

    fetchPromotion();
  }, [placementType, videoId, subjectId, batchId]);

  // Countdown timer
  useEffect(() => {
    if (!isVisible || !promotion) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, promotion]);

  // Auto-close after 30 seconds
  useEffect(() => {
    if (!isVisible) return;

    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, 30000);

    return () => clearTimeout(autoCloseTimer);
  }, [isVisible]);

  const trackAnalytics = async (promotionId: string, actionType: string) => {
    try {
      await fetch("/api/brand-promotions/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promotionId,
          videoId,
          actionType,
          deviceType: window.innerWidth <= 768 ? "mobile" : window.innerWidth <= 1024 ? "tablet" : "desktop",
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error("Error tracking analytics:", error);
    }
  };

  const handleSkip = () => {
    if (promotion) {
      trackAnalytics(promotion.id, "skip");
    }
    setIsVisible(false);
    onSkip?.();
  };

  const handleClose = () => {
    if (promotion) {
      trackAnalytics(promotion.id, "complete");
    }
    setIsVisible(false);
    onComplete?.();
  };

  const handleCTAClick = () => {
    if (!promotion) return;
    
    trackAnalytics(promotion.id, "click");
    
    if (promotion.websiteUrl) {
      window.open(promotion.websiteUrl, "_blank", "noopener,noreferrer");
    }
  };

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const togglePlay = () => {
    if (!videoRef) return;
    
    if (isPlaying) {
      videoRef.pause();
    } else {
      videoRef.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef) return;
    
    videoRef.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!isVisible || !promotion) {
    return null;
  }

  const youtubeVideoId = promotion.videoUrl ? getYouTubeVideoId(promotion.videoUrl) : null;

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-4xl mx-auto overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {promotion.brandLogo && (
                <img 
                  src={promotion.brandLogo} 
                  alt={promotion.brandName}
                  className="w-10 h-10 object-contain rounded-full bg-white p-1"
                />
              )}
              <div>
                <h3 className="font-semibold text-lg">{promotion.brandName}</h3>
                <p className="text-blue-100 text-sm">{promotion.productName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white">
                Sponsored
              </Badge>
              {canSkip ? (
                <Button variant="outline" size="sm" onClick={handleSkip} className="text-white border-white/50 hover:bg-white/10">
                  Skip Ad
                  <X className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <div className="text-sm bg-white/20 px-3 py-1 rounded">
                  Skip in {countdown}s
                </div>
              )}
            </div>
          </div>

          {/* Video Content */}
          <div className="relative aspect-video bg-black">
            {youtubeVideoId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => trackAnalytics(promotion.id, "view")}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center p-8">
                  {promotion.brandLogo && (
                    <img 
                      src={promotion.brandLogo} 
                      alt={promotion.brandName}
                      className="w-24 h-24 object-contain mx-auto mb-4 rounded-lg shadow-lg"
                    />
                  )}
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{promotion.productName}</h3>
                  {promotion.productDescription && (
                    <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                      {promotion.productDescription}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Section */}
          <div className="p-4 bg-gray-50 flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{promotion.productName}</h4>
              {promotion.productDescription && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {promotion.productDescription}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 ml-4">
              {promotion.websiteUrl && (
                <Button onClick={handleCTAClick} className="bg-blue-600 hover:bg-blue-700">
                  {promotion.callToAction}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              )}
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-gray-200">
            <div 
              className="h-full bg-blue-600 transition-all duration-1000"
              style={{ width: `${((7 - countdown) / 7) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for easy integration
export function useBrandVideoAd(
  placementType: "pre-roll" | "mid-roll" | "post-roll" | "between-videos",
  context: { videoId?: string; subjectId?: string; batchId?: string }
) {
  const [showAd, setShowAd] = useState(false);

  const triggerAd = () => {
    setShowAd(true);
  };

  const hideAd = () => {
    setShowAd(false);
  };

  const AdComponent = showAd ? (
    <BrandVideoAd
      placementType={placementType}
      videoId={context.videoId}
      subjectId={context.subjectId}
      batchId={context.batchId}
      onSkip={hideAd}
      onComplete={hideAd}
    />
  ) : null;

  return {
    AdComponent,
    triggerAd,
    hideAd,
    isShowing: showAd,
  };
}