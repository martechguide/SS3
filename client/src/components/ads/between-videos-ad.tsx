import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Play, SkipForward } from 'lucide-react';
import { useAdSystem } from '@/hooks/use-ad-system';

interface BetweenVideosAdProps {
  onAdComplete: () => void;
  onSkip: () => void;
  nextVideoTitle?: string;
}

export default function BetweenVideosAd({ onAdComplete, onSkip, nextVideoTitle }: BetweenVideosAdProps) {
  const { configs } = useAdSystem();
  const [currentAd, setCurrentAd] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(7);
  const [canSkip, setCanSkip] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Get enabled between-videos ads
  const betweenAds = configs.filter(ad => 
    ad.enabled && 
    ad.format === 'video' && 
    ad.placement === 'between-videos'
  );

  useEffect(() => {
    if (betweenAds.length > 0) {
      // Select random ad from available ones
      const randomAd = betweenAds[Math.floor(Math.random() * betweenAds.length)];
      setCurrentAd(randomAd);
      setTimeLeft(randomAd.skipAfter || 7);
    } else {
      // No ads available, proceed to next video
      onAdComplete();
    }
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && isPlaying) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanSkip(true);
    }
  }, [timeLeft, isPlaying]);

  const handleSkip = () => {
    onSkip();
    onAdComplete();
  };

  const handlePlayAd = () => {
    setIsPlaying(true);
  };

  const handleAdComplete = () => {
    onAdComplete();
  };

  if (!currentAd) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4">
        <CardContent className="p-0">
          {/* Ad Header */}
          <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Advertisement</span>
              <span className="text-xs text-gray-400">
                ({currentAd.type === 'adsterra' ? 'Adsterra' : 'PropellerAds'})
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {canSkip ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSkip}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  <SkipForward className="h-4 w-4 mr-1" />
                  Skip Ad
                </Button>
              ) : (
                <span className="text-sm text-gray-300">
                  Skip available in {timeLeft}s
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-white hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Video Ad Container */}
          <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
            {!isPlaying ? (
              // Ad Preview/Play Button
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
                <div className="text-center text-white">
                  <Button
                    onClick={handlePlayAd}
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full w-20 h-20"
                  >
                    <Play className="h-8 w-8 ml-1" />
                  </Button>
                  <p className="mt-4 text-lg font-semibold">Watch advertisement</p>
                  <p className="text-sm text-gray-300">Support our educational content</p>
                  {currentAd.vastTag && currentAd.vastTag.includes('YOUR_KEY') && (
                    <p className="text-xs text-yellow-400 mt-2">
                      Demo mode - Real ads will show after setup
                    </p>
                  )}
                </div>
              </div>
            ) : (
              // Actual Video Ad
              <div className="absolute inset-0">
                {currentAd.vastTag && !currentAd.vastTag.includes('YOUR_KEY') ? (
                  // Real VAST ad
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    onEnded={handleAdComplete}
                    controls={false}
                  >
                    <source src={currentAd.vastTag} type="video/mp4" />
                  </video>
                ) : (
                  // Demo ad when no real code is configured
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-green-600 to-blue-600 text-white">
                    <div className="text-center">
                      <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                      <h3 className="text-xl font-bold mb-2">Sample Video Ad</h3>
                      <p className="text-sm opacity-90">Configure your {currentAd.type} VAST tag in admin panel</p>
                      <p className="text-xs mt-2">Ad will complete automatically</p>
                    </div>
                  </div>
                )}
                
                {/* Skip button overlay */}
                {canSkip && (
                  <div className="absolute top-4 right-4">
                    <Button
                      onClick={handleSkip}
                      size="sm"
                      className="bg-black bg-opacity-70 text-white hover:bg-opacity-90"
                    >
                      <SkipForward className="h-4 w-4 mr-1" />
                      Skip
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Next Video Preview */}
          {nextVideoTitle && (
            <div className="bg-gray-50 p-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Next video:</p>
                  <p className="font-medium text-gray-900">{nextVideoTitle}</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleSkip}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  Continue Learning
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-complete timer for demo mode */}
      {isPlaying && currentAd.vastTag && currentAd.vastTag.includes('YOUR_KEY') && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
            Demo ad will complete automatically in 3 seconds...
          </div>
        </div>
      )}
    </div>
  );
}

// Auto-complete demo ad after 3 seconds when playing
setTimeout(() => {
  if (typeof window !== 'undefined') {
    const demoComplete = new CustomEvent('demoAdComplete');
    window.dispatchEvent(demoComplete);
  }
}, 3000);