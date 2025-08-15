import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Play, X, SkipForward, Volume2, VolumeX } from "lucide-react";
import type { AdConfig } from './ad-manager';

interface VideoAdsProps {
  type: 'pre-roll' | 'mid-roll' | 'post-roll' | 'between-videos';
  adConfigs: AdConfig[];
  onComplete: () => void;
  onSkip?: () => void;
  skipAfter?: number; // seconds
}

export default function VideoAds({ 
  type, 
  adConfigs, 
  onComplete, 
  onSkip, 
  skipAfter = 5 
}: VideoAdsProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const relevantAds = adConfigs.filter(ad => 
    ad.format === 'video' && ad.enabled && 
    ad.placement === 'between-videos'
  );

  useEffect(() => {
    if (relevantAds.length === 0) {
      onComplete();
      return;
    }

    loadCurrentAd();
  }, [currentAdIndex, relevantAds.length]);

  useEffect(() => {
    // Enable skip button after specified time
    if (isPlaying && currentTime >= skipAfter) {
      setCanSkip(true);
    }
  }, [currentTime, skipAfter, isPlaying]);

  const loadCurrentAd = async () => {
    const currentAd = relevantAds[currentAdIndex];
    if (!currentAd) return;

    setIsLoading(true);

    if (currentAd.type === 'adsterra' && currentAd.vastTag) {
      await loadVastAd(currentAd.vastTag);
    } else if (currentAd.type === 'promotional' && currentAd.clickUrl) {
      // Handle promotional video ads
      setIsLoading(false);
    }
  };

  const loadVastAd = async (vastTag: string) => {
    try {
      const response = await fetch(vastTag);
      const vastXml = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(vastXml, 'text/xml');
      
      // Extract video URL from VAST XML
      const mediaFiles = xmlDoc.getElementsByTagName('MediaFile');
      if (mediaFiles.length > 0 && videoRef.current) {
        const videoUrl = mediaFiles[0].textContent?.trim();
        if (videoUrl) {
          videoRef.current.src = videoUrl;
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error loading VAST ad:', error);
      handleNextAd();
    }
  };

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSkip = () => {
    if (canSkip || onSkip) {
      onSkip?.();
      handleNextAd();
    }
  };

  const handleNextAd = () => {
    if (currentAdIndex < relevantAds.length - 1) {
      setCurrentAdIndex(currentAdIndex + 1);
      setCurrentTime(0);
      setCanSkip(false);
      setIsPlaying(false);
    } else {
      onComplete();
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    handleNextAd();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleAdClick = () => {
    const currentAd = relevantAds[currentAdIndex];
    if (currentAd?.clickUrl) {
      window.open(currentAd.clickUrl, '_blank');
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (relevantAds.length === 0) {
    return null;
  }

  const currentAd = relevantAds[currentAdIndex];

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black z-[2000] flex items-center justify-center"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Container */}
      <div className="relative w-full h-full max-w-4xl mx-auto">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading advertisement...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Video Element */}
            <video
              ref={videoRef}
              className="w-full h-full object-contain cursor-pointer"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnd}
              onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
              onClick={handleAdClick}
              muted={isMuted}
            />

            {/* Ad Overlay Information */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
              Advertisement {currentAdIndex + 1} of {relevantAds.length}
            </div>

            {/* Skip Button */}
            {(canSkip || onSkip) && (
              <div className="absolute top-4 right-4">
                <Button
                  onClick={handleSkip}
                  variant="secondary"
                  size="sm"
                  className="bg-black/50 text-white hover:bg-black/70"
                >
                  <SkipForward className="h-4 w-4 mr-1" />
                  Skip Ad
                </Button>
              </div>
            )}

            {/* Skip Countdown */}
            {!canSkip && skipAfter > 0 && currentTime < skipAfter && (
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
                Skip in {Math.ceil(skipAfter - currentTime)}s
              </div>
            )}

            {/* Control Overlay */}
            {showControls && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center text-white text-sm mb-2">
                    <span>{formatTime(currentTime)}</span>
                    <div className="flex-1 mx-3">
                      <div className="w-full bg-white/20 rounded-full h-1">
                        <div 
                          className="bg-white h-1 rounded-full transition-all duration-200" 
                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={isPlaying ? handlePause : handlePlay}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <Play className={`h-5 w-5 ${isPlaying ? 'hidden' : 'block'}`} />
                      <div className={`w-5 h-5 ${isPlaying ? 'block' : 'hidden'}`}>
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-5 bg-white"></div>
                          <div className="w-1.5 h-5 bg-white"></div>
                        </div>
                      </div>
                    </Button>

                    <Button
                      onClick={toggleMute}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </Button>
                  </div>

                  {/* Ad Info */}
                  <div className="text-white text-sm">
                    {currentAd.type === 'promotional' ? (
                      <span>Sponsored Content</span>
                    ) : currentAd.type === 'adsterra' ? (
                      <span>Powered by Adsterra</span>
                    ) : (
                      <span>Advertisement</span>
                    )}
                  </div>

                  {/* Close Button */}
                  <Button
                    onClick={onComplete}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Click-to-play overlay when paused */}
            {!isPlaying && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  onClick={handlePlay}
                  size="lg"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Play className="h-8 w-8 mr-2" />
                  Play Ad
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}