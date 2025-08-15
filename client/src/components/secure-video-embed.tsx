import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Shield, ChevronUp, ChevronDown } from "lucide-react";
import YouTubeProtectionOverlay from "./youtube-protection-overlay";
import VideoProtectionSystem from "./video-protection-system";
import VideoSeekControls, { useVideoSeekControls } from "./video-seek-controls";
import PauseOverlayAd from "./ads/pause-overlay-ad";
import { AdConfig } from "./ads/ad-manager";

interface SecureVideoEmbedProps {
  videoId: string;
  title: string;
  onProgress?: (watchTime: number, completed?: boolean) => void;
  adConfigs?: AdConfig[];
}

// Extract YouTube video ID from various URL formats
function extractVideoId(url: string): string {
  if (url.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }
  
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return url;
}

export default function SecureVideoEmbed({ videoId: rawVideoId, title, onProgress, adConfigs = [] }: SecureVideoEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [controlsManuallyOpened, setControlsManuallyOpened] = useState(false);
  const [showPauseAd, setShowPauseAd] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const progressRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Video seeking controls
  const seekControls = useVideoSeekControls(iframeRef);

  const videoId = extractVideoId(rawVideoId);

  // Maximum security YouTube embed URL
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?` + 
    `rel=0&modestbranding=1&showinfo=0&fs=0&cc_load_policy=0&iv_load_policy=3&` +
    `autohide=1&controls=1&disablekb=1&enablejsapi=1&playsinline=1&` +
    `origin=${encodeURIComponent(window.location.origin)}&` +
    `widget_referrer=${encodeURIComponent(window.location.origin)}&` +
    `loop=0&autoplay=0`;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube-nocookie.com" && event.origin !== "https://www.youtube.com") return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (data.event === "video-ready" || data.event === "onReady") {
          setIsLoading(false);
          setError(null);
        } else if (data.event === "onStateChange") {
          // 1 = playing, 2 = paused
          if (data.info === 1) {
            setIsPlaying(true);
            setVideoPaused(false);
            setShowPauseAd(false);
            containerRef.current?.classList.add('playing');
          } else if (data.info === 2) {
            setIsPlaying(false);
            setVideoPaused(true);
            containerRef.current?.classList.remove('playing');
          } else {
            setIsPlaying(false);
            setVideoPaused(false);
            setShowPauseAd(false);
            containerRef.current?.classList.remove('playing');
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    };

    window.addEventListener("message", handleMessage);
    
    // Block right-click context menu on the container
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Block keyboard shortcuts that might reveal YouTube branding
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block common YouTube shortcuts and copy operations
      if (e.key === 'Escape' || e.key === 'Tab' || 
          (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 'c' || e.key === 'C')) ||
          (e.metaKey && (e.key === 'u' || e.key === 'U' || e.key === 'c' || e.key === 'C')) ||
          e.key === 'F12' || e.key === 'F11' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i'))) {
        e.preventDefault();
        return false;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('contextmenu', handleContextMenu);
      container.addEventListener('keydown', handleKeyDown);
    }

    // Simulate progress tracking
    intervalRef.current = setInterval(() => {
      if (!isLoading && !error && onProgress && isPlaying) {
        progressRef.current += 5;
        onProgress(progressRef.current);
      }
    }, 5000);

    return () => {
      window.removeEventListener("message", handleMessage);
      if (container) {
        container.removeEventListener('contextmenu', handleContextMenu);
        container.removeEventListener('keydown', handleKeyDown);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [videoId, isLoading, onProgress, error, isPlaying]);

  // Auto-hide controls after inactivity when manually opened
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (controlsManuallyOpened && showControls) {
      timeout = setTimeout(() => {
        setControlsManuallyOpened(false);
        setShowControls(false);
      }, 5000); // Hide after 5 seconds of inactivity
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [controlsManuallyOpened, showControls]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    setIsLoading(false);
    setError("Video could not be loaded. Please check if the YouTube video ID is correct and accessible.");
  };

  // Block iframe navigation attempts
  const handleIframeClick = (e: React.MouseEvent) => {
    // Allow clicks in the center area for play/pause
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Block clicks in corners and edges where YouTube branding appears
    if (
      (x < 150 && y > rect.height - 60) || // Bottom left corner
      (x > rect.width - 150 && y > rect.height - 60) || // Bottom right corner
      (y < 50) || // Top area
      (x > rect.width - 100 && y < rect.height / 2) // Right side
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative bg-black secure-video-container rounded-lg overflow-hidden" 
      style={{ paddingBottom: "56.25%", height: 0 }}
      onContextMenu={(e) => e.preventDefault()}
      onMouseEnter={() => !controlsManuallyOpened && setShowControls(true)}
      onMouseLeave={() => !controlsManuallyOpened && setShowControls(false)}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading secure video content...</p>
            <div className="flex items-center justify-center mt-2 text-sm text-gray-400">
              <Shield className="h-4 w-4 mr-1" />
              <span>Protected Content</span>
            </div>
          </div>
        </div>
      )}
      {error ? (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
          <Card className="bg-gray-900 border-gray-700 text-white max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure Video Loading Issue</h3>
              <p className="text-gray-300 mb-4 text-sm">{error}</p>
              <div className="text-xs text-gray-400">
                <div className="flex items-center justify-center mb-2">
                  <Shield className="h-4 w-4 mr-1" />
                  <span>Content protection is active</span>
                </div>
                <p>This video is protected from external access</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={title}
            className="absolute top-0 left-0 w-full h-full border-0 secure-youtube-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen={false}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            onClick={handleIframeClick}
          />
          
          {/* Comprehensive YouTube Protection System */}
          <YouTubeProtectionOverlay containerRef={containerRef} />
          
          {/* Responsive visual patches to hide YouTube branding elements across all devices */}
          
          {/* Universal Video Protection System - Applied to ALL embeds */}
          <VideoProtectionSystem />
          
          {/* Additional protection patches for secure video embed */}
          <div className="absolute top-0 right-0 w-20 h-10 sm:w-24 sm:h-12 md:w-32 md:h-16 bg-black z-20 pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-24 h-8 sm:bottom-2 sm:left-2 sm:w-28 md:w-36 sm:h-10 md:h-12 bg-black rounded z-20 pointer-events-none" />

          {/* Arrow button to toggle controls */}
          {!isLoading && !error && (
            <div className="absolute bottom-2 right-2 z-[1001]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setControlsManuallyOpened(!controlsManuallyOpened);
                  setShowControls(!showControls);
                }}
                className="bg-black/60 hover:bg-black/80 text-white p-1 h-8 w-8 rounded-full"
                title={showControls ? "Hide Controls" : "Show Controls"}
              >
                {showControls ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          )}

          {/* Video seeking controls - appears when arrow button clicked or on hover */}
          {showControls && !isLoading && !error && (
            <div className="absolute bottom-0 left-0 right-0 z-[1000]">
              <VideoSeekControls
                isPlaying={seekControls.isPlaying}
                currentTime={seekControls.currentTime}
                duration={seekControls.duration}
                onSeek={seekControls.handleSeek}
                onPlayPause={seekControls.handlePlayPause}
                onSkipBackward={seekControls.handleSkipBackward}
                onSkipForward={seekControls.handleSkipForward}
                onQualityChange={seekControls.handleQualityChange}
                className="animate-in slide-in-from-bottom-2 duration-300 rounded-none"
              />
            </div>
          )}

          {/* Pause Overlay Ad */}
          <PauseOverlayAd
            isVisible={videoPaused && !isLoading && !error}
            onClose={() => setShowPauseAd(false)}
            onResume={() => {
              setVideoPaused(false);
              setShowPauseAd(false);
              // Send resume command to YouTube iframe
              if (iframeRef.current) {
                const message = {
                  event: 'command',
                  func: 'playVideo',
                  args: []
                };
                iframeRef.current.contentWindow?.postMessage(JSON.stringify(message), '*');
              }
            }}
            adConfigs={adConfigs}
          />
        </>
      )}
    </div>
  );
}