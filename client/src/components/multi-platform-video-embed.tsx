import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export type VideoPlatform = 'youtube' | 'vimeo' | 'facebook' | 'dailymotion' | 'twitch' | 'peertube' | 'rumble' | 'telegram';

interface MultiPlatformVideoEmbedProps {
  platform: VideoPlatform;
  videoId?: string;
  videoUrl: string;
  title: string;
  className?: string;
}

const getEmbedUrl = (platform: VideoPlatform, videoId?: string, videoUrl?: string): string => {
  switch (platform) {
    case 'youtube':
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3`;
    
    case 'vimeo':
      return `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479`;
    
    case 'facebook':
      // Facebook videos need special handling - they don't have traditional embed URLs
      return videoUrl || '';
    
    case 'dailymotion':
      return `https://www.dailymotion.com/embed/video/${videoId}`;
    
    case 'twitch':
      if (videoId) {
        return `https://player.twitch.tv/?video=${videoId}&parent=${window.location.hostname}`;
      }
      return videoUrl || '';
    
    case 'peertube':
      // PeerTube instances vary, so we use the full URL
      return videoUrl?.replace('/watch/', '/embed/') || '';
    
    case 'rumble':
      // Rumble embed URL pattern
      return videoUrl?.replace('rumble.com/', 'rumble.com/embed/') || '';
    
    case 'telegram':
      // Telegram videos cannot be embedded directly
      return '';
    
    default:
      return videoUrl || '';
  }
};

const getIframeProps = (platform: VideoPlatform) => {
  const baseProps = {
    frameBorder: "0",
    allowFullScreen: true,
    className: "w-full h-full"
  };

  switch (platform) {
    case 'youtube':
      return {
        ...baseProps,
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      };
    
    case 'vimeo':
      return {
        ...baseProps,
        allow: "autoplay; fullscreen; picture-in-picture"
      };
    
    case 'facebook':
      return {
        ...baseProps,
        allow: "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      };
    
    case 'dailymotion':
      return {
        ...baseProps,
        allow: "autoplay; fullscreen"
      };
    
    case 'twitch':
      return {
        ...baseProps,
        allow: "autoplay; fullscreen"
      };
    
    default:
      return baseProps;
  }
};

const renderFacebookVideo = (videoUrl: string, title: string) => {
  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center space-y-4 p-8">
          <div className="text-4xl">📘</div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-gray-600 text-sm mb-4">
            Facebook videos cannot be embedded directly. Click below to watch on Facebook.
          </p>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2">📘</span>
            Watch on Facebook
          </a>
        </div>
      </div>
    </div>
  );
};

const renderCustomPlatform = (platform: VideoPlatform, videoUrl: string, title: string) => {
  const platformNames = {
    peertube: 'PeerTube',
    rumble: 'Rumble',
    telegram: 'Telegram'
  };

  const platformIcons = {
    peertube: '🔗',
    rumble: '🏆',
    telegram: '📱'
  };

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center space-y-4 p-8">
          <div className="text-4xl">{platformIcons[platform] || '📹'}</div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-gray-600 text-sm mb-4">
            Watch this video on {platformNames[platform] || platform}
          </p>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            <span className="mr-2">{platformIcons[platform] || '📹'}</span>
            Watch on {platformNames[platform] || platform}
          </a>
        </div>
      </div>
    </div>
  );
};

export default function MultiPlatformVideoEmbed({ 
  platform, 
  videoId, 
  videoUrl, 
  title, 
  className = "" 
}: MultiPlatformVideoEmbedProps) {
  const embedUrl = getEmbedUrl(platform, videoId, videoUrl);
  const iframeProps = getIframeProps(platform);

  // Special handling for platforms that don't support direct embedding
  if (platform === 'facebook') {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-0">
          {renderFacebookVideo(videoUrl, title)}
        </CardContent>
      </Card>
    );
  }

  if (platform === 'peertube' || platform === 'rumble' || platform === 'telegram') {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-0">
          {renderCustomPlatform(platform, videoUrl, title)}
        </CardContent>
      </Card>
    );
  }

  // For platforms that support iframe embedding
  if (!embedUrl) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-0">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center space-y-2">
                <p className="text-gray-600">Unable to embed video</p>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Open in new tab
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            {...iframeProps}
            src={embedUrl}
            title={title}
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}