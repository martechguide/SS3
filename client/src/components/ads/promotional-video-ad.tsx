import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Play, Pause, Volume2, VolumeX, SkipForward } from "lucide-react";
import type { BrandPromotion } from "@shared/schema";

interface PromotionalVideoAdProps {
  videoId?: string;
  subjectId?: string;
  batchId?: string;
  onAdComplete?: () => void;
  placement: "pre-roll" | "mid-roll" | "between-videos";
}

export default function PromotionalVideoAd({
  videoId,
  subjectId,
  batchId,
  onAdComplete,
  placement
}: PromotionalVideoAdProps) {
  const [promotion, setPromotion] = useState<BrandPromotion | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [skipTimer, setSkipTimer] = useState(5);
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadPromotion();
    
    // Cleanup function
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
      }
      if (skipIntervalRef.current) {
        clearInterval(skipIntervalRef.current);
      }
    };
  }, [videoId, subjectId, batchId, placement]);

  useEffect(() => {
    if (isVisible && !canSkip) {
      skipIntervalRef.current = setInterval(() => {
        setSkipTimer(prev => {
          if (prev <= 1) {
            setCanSkip(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (skipIntervalRef.current) {
        clearInterval(skipIntervalRef.current);
      }
    };
  }, [isVisible, canSkip]);

  const loadPromotion = async () => {
    try {
      const params = new URLSearchParams();
      params.append("placement", placement);
      if (videoId) params.append("videoId", videoId);
      if (subjectId) params.append("subjectId", subjectId);
      if (batchId) params.append("batchId", batchId);

      const response = await fetch(`/api/brand-promotions/active?${params.toString()}`, {
        headers: { "Content-Type": "application/json" }
      });
      const promotions = await response.json();
      
      if (promotions && promotions.length > 0) {
        // Get video promotion (filter by video URL presence)
        const videoPromotions = promotions.filter((p: BrandPromotion) => 
          p.videoUrl && p.videoUrl.trim() !== ""
        );
        
        if (videoPromotions.length > 0) {
          const selectedPromotion = videoPromotions.sort((a: BrandPromotion, b: BrandPromotion) => 
            (b.priority || 1) - (a.priority || 1)
          )[0];
          
          setPromotion(selectedPromotion);
          setIsVisible(true);
          trackAnalytics(selectedPromotion.id, "impression");
        }
      }
    } catch (error) {
      console.error("Error loading promotional video ad:", error);
    }
  };

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

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      if (promotion) {
        trackAnalytics(promotion.id, "play");
      }
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleSkip = () => {
    if (promotion) {
      trackAnalytics(promotion.id, "skip");
    }
    closeAd();
  };

  const handleAdClick = () => {
    if (promotion) {
      trackAnalytics(promotion.id, "click");
      if (promotion.websiteUrl) {
        window.open(promotion.websiteUrl, "_blank");
      }
    }
  };

  const closeAd = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
    }
    setIsVisible(false);
    onAdComplete?.();
  };

  const handleVideoEnd = () => {
    if (promotion) {
      trackAnalytics(promotion.id, "complete");
    }
    closeAd();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      // Auto-play if allowed
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play prevented, show play button
          setIsPlaying(false);
        });
      }
    }
  };

  if (!isVisible || !promotion || !promotion.videoUrl) {
    return null;
  }

  // Additional safety check to prevent React DOM errors
  if (typeof window === 'undefined') {
    return null;
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <Card className="relative w-full max-w-4xl bg-black border-gray-700">
        {/* Skip Button */}
        <div className="absolute top-4 right-4 z-10">
          {canSkip ? (
            <Button
              onClick={handleSkip}
              variant="secondary"
              size="sm"
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip Ad
            </Button>
          ) : (
            <div className="bg-gray-800 text-white px-3 py-2 rounded text-sm">
              Ad will be skippable in {skipTimer}s
            </div>
          )}
        </div>

        {/* Video Container */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={promotion.videoUrl}
            className="w-full h-full object-cover cursor-pointer"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnd}
            onClick={handleAdClick}
            onError={(e) => {
              console.error("Video load error:", e);
              // Skip the ad if video fails to load
              handleSkip();
            }}
            muted={isMuted}
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
          />

          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="w-full bg-gray-600 h-1 rounded-full mb-3">
              <div 
                className="bg-red-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  onClick={isPlaying ? handlePause : handlePlay}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                
                <Button
                  onClick={handleMute}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>

                <div className="text-white text-sm">
                  {Math.floor(currentTime)}s / {Math.floor(duration)}s
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Ad Info */}
                <div className="text-white text-xs bg-yellow-600 px-2 py-1 rounded">
                  AD
                </div>
                
                {/* Brand Info */}
                <div className="text-white text-sm">
                  {promotion.brandName}
                </div>
              </div>
            </div>
          </div>

          {/* Click Overlay */}
          {promotion.websiteUrl && (
            <div 
              className="absolute inset-0 cursor-pointer"
              onClick={handleAdClick}
            />
          )}
        </div>

        {/* Ad Description */}
        {promotion.productDescription && (
          <div className="p-4 bg-gray-900 text-white">
            <h3 className="font-semibold text-lg mb-2">{promotion.productName}</h3>
            <p className="text-gray-300 text-sm">{promotion.productDescription}</p>
            {promotion.websiteUrl && (
              <Button
                onClick={handleAdClick}
                className="mt-3 bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                {promotion.callToAction || "Learn More"}
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}