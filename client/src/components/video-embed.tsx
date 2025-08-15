import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertCircle } from "lucide-react";
import VideoProtectionSystem from "./video-protection-system";
import VideoSeekControls, { useVideoSeekControls } from "./video-seek-controls";
import PauseOverlayAd from "./ads/pause-overlay-ad";
import { AdConfig } from "./ads/ad-manager";

interface VideoEmbedProps {
  videoId: string;
  title: string;
  onProgress?: (watchTime: number, completed?: boolean) => void;
  adConfigs?: AdConfig[];
}

// Extract YouTube video ID from various URL formats
function extractVideoId(url: string): string {
  // If it's already just an ID (11 characters), return as is
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
  
  return url; // Return original if no match
}

export default function VideoEmbed({ videoId: rawVideoId, title, onProgress, adConfigs = [] }: VideoEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const progressRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Video seeking controls
  const seekControls = useVideoSeekControls(iframeRef);

  // Extract clean video ID
  const videoId = extractVideoId(rawVideoId);

  // Enhanced YouTube embed URL with maximum branding removal and redirect blocking
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?` + 
    `rel=0&modestbranding=1&showinfo=0&fs=0&cc_load_policy=0&iv_load_policy=3&` +
    `autohide=1&controls=1&disablekb=1&enablejsapi=1&playsinline=1&` +
    `origin=${encodeURIComponent(window.location.origin)}&widget_referrer=${encodeURIComponent(window.location.origin)}`;

  const fallbackEmbedUrl = `https://www.youtube.com/embed/${videoId}?` +
    `rel=0&modestbranding=1&showinfo=0&fs=0&controls=1&disablekb=1&playsinline=1&` +
    `origin=${encodeURIComponent(window.location.origin)}`;

  useEffect(() => {
    let loadTimeout: NodeJS.Timeout;
    
    const handleMessage = (event: MessageEvent) => {
      // Handle YouTube player events
      if (event.origin !== "https://www.youtube-nocookie.com" && event.origin !== "https://www.youtube.com") return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.event === "video-ready" || data.event === "onReady") {
          setIsLoading(false);
          setError(null);
        } else if (data.event === "onStateChange") {
          // 1 = playing, 2 = paused
          if (data.info === 1) {
            setVideoPaused(false);
          } else if (data.info === 2) {
            setVideoPaused(true);
          }
        } else if (data.event === "video-progress") {
          const currentTime = data.info || data.currentTime || 0;
          if (currentTime > 0) {
            progressRef.current = currentTime;
            onProgress?.(currentTime);
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    };

    window.addEventListener("message", handleMessage);
    
    // Set a timeout to detect loading issues
    loadTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        // Don't set error immediately, let iframe try to load
      }
    }, 8000);

    // Simulate basic progress tracking
    intervalRef.current = setInterval(() => {
      if (!isLoading && !error && onProgress) {
        progressRef.current += 5;
        onProgress(progressRef.current);
      }
    }, 5000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(loadTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [videoId, isLoading, onProgress, error]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    setIsLoading(false);
    if (retryCount === 0) {
      setError("primary_failed");
    } else {
      setError("Video could not be loaded. Please check if the YouTube video ID is correct and the video is accessible.");
    }
  };

  const retryLoad = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setIsLoading(true);
  };

  const openInYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  const currentEmbedUrl = error === "primary_failed" ? fallbackEmbedUrl : embedUrl;

  return (
    <div 
      className="relative bg-black video-embed-container rounded-lg overflow-hidden" 
      style={{ paddingBottom: "56.25%", height: 0 }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading video content...</p>
            <p className="text-sm text-gray-400 mt-2">Video ID: {videoId}</p>
          </div>
        </div>
      )}
      
      {error && error !== "primary_failed" ? (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
          <Card className="bg-gray-900 border-gray-700 text-white max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Video Loading Issue</h3>
              <p className="text-gray-300 mb-4 text-sm">{error}</p>
              <div className="space-y-2">
                <div className="text-xs text-gray-400">
                  <p>Video ID: <code className="bg-gray-800 px-1 rounded">{videoId}</code></p>
                  <p className="mt-1">Make sure the video is:</p>
                  <ul className="text-left mt-1 ml-4">
                    <li>• Public or Unlisted (not Private)</li>
                    <li>• Embeddable (not restricted)</li>
                    <li>• Valid YouTube video ID</li>
                  </ul>
                </div>
                <div className="flex space-x-2 justify-center mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={retryLoad}
                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                  >
                    Retry
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={openInYouTube}
                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open in YouTube
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <iframe
            ref={iframeRef}
            src={currentEmbedUrl}
            title={title}
            className="absolute top-0 left-0 w-full h-full border-0 youtube-embed-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
          {/* Universal Video Protection System - Applied to ALL embeds */}
          <VideoProtectionSystem />

          {/* Video seeking controls - appears on hover */}
          {showControls && !isLoading && error !== "primary_failed" && (
            <div className="absolute bottom-4 left-4 right-4 z-[1000]">
              <VideoSeekControls
                isPlaying={seekControls.isPlaying}
                currentTime={seekControls.currentTime}
                duration={seekControls.duration}
                onSeek={seekControls.handleSeek}
                onPlayPause={seekControls.handlePlayPause}
                onSkipBackward={seekControls.handleSkipBackward}
                onSkipForward={seekControls.handleSkipForward}
                className="animate-in slide-in-from-bottom-2 duration-300"
              />
            </div>
          )}

          {/* Pause Overlay Ad */}
          <PauseOverlayAd
            isVisible={videoPaused && !isLoading && error !== "primary_failed"}
            onClose={() => setVideoPaused(false)}
            onResume={() => {
              setVideoPaused(false);
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
