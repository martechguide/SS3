import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import MultiPlatformVideoEmbed from "@/components/multi-platform-video-embed";
import SecureVideoEmbed from "@/components/secure-video-embed";
import type { Video, MultiPlatformVideo } from "@shared/schema";

interface PlatformVideoTabsProps {
  youtubeVideos: Video[];
  multiPlatformVideos: MultiPlatformVideo[];
  className?: string;
}

const formatDuration = (seconds: number | null) => {
  if (!seconds) return "N/A";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getPlatformColor = (platform: string) => {
  const colors = {
    youtube: 'bg-red-500',
    vimeo: 'bg-blue-500',
    facebook: 'bg-blue-600',
    dailymotion: 'bg-orange-500',
    twitch: 'bg-purple-500',
    peertube: 'bg-orange-600',
    rumble: 'bg-green-600'
  };
  return colors[platform as keyof typeof colors] || 'bg-gray-500';
};

const getPlatformIcon = (platform: string) => {
  const icons = {
    youtube: '▶️',
    vimeo: '🎬',
    facebook: '📘',
    dailymotion: '🎥',
    twitch: '🎮',
    peertube: '🔗',
    rumble: '🏆'
  };
  return icons[platform as keyof typeof icons] || '📹';
};

// Group multi-platform videos by platform
const groupVideosByPlatform = (videos: MultiPlatformVideo[]) => {
  return videos.reduce((acc, video) => {
    if (!acc[video.platform]) {
      acc[video.platform] = [];
    }
    acc[video.platform].push(video);
    return acc;
  }, {} as Record<string, MultiPlatformVideo[]>);
};

export default function PlatformVideoTabs({ youtubeVideos, multiPlatformVideos, className = "" }: PlatformVideoTabsProps) {
  const [selectedTab, setSelectedTab] = useState("youtube");
  
  const platformGroups = groupVideosByPlatform(multiPlatformVideos);
  const platforms = Object.keys(platformGroups);
  
  // Count total videos per platform
  const getVideoCounts = () => {
    const counts = { youtube: youtubeVideos.length };
    platforms.forEach(platform => {
      counts[platform] = platformGroups[platform].length;
    });
    return counts;
  };

  const videoCounts = getVideoCounts();

  return (
    <div className={`w-full ${className}`}>
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-auto gap-1 bg-gray-100 dark:bg-gray-800 p-1">
          {/* YouTube Tab */}
          <TabsTrigger 
            value="youtube" 
            className="flex items-center space-x-2 data-[state=active]:bg-red-500 data-[state=active]:text-white"
          >
            <span>▶️</span>
            <span>YouTube</span>
            <Badge variant="secondary" className="ml-1">
              {videoCounts.youtube}
            </Badge>
          </TabsTrigger>

          {/* Dynamic Platform Tabs */}
          {platforms.map(platform => (
            <TabsTrigger 
              key={platform}
              value={platform}
              className={`flex items-center space-x-2 data-[state=active]:${getPlatformColor(platform)} data-[state=active]:text-white`}
            >
              <span>{getPlatformIcon(platform)}</span>
              <span className="capitalize">{platform}</span>
              <Badge variant="secondary" className="ml-1">
                {videoCounts[platform]}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* YouTube Videos Content */}
        <TabsContent value="youtube" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <span>▶️</span>
                <span>YouTube Videos</span>
                <Badge>{youtubeVideos.length}</Badge>
              </h3>
            </div>
            
            {youtubeVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {youtubeVideos.map((video, index) => (
                  <Card key={video.id} className="shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-3 mb-4">
                        <div className="h-8 w-8 bg-red-500 bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-red-500 font-semibold text-sm">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{video.title}</h4>
                          {video.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{video.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{formatDuration(video.duration)}</span>
                        </div>
                        <Badge className="bg-red-100 text-red-700">YouTube</Badge>
                      </div>
                      
                      <Link href={`/video/${video.id}`}>
                        <Button className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700">
                          <Play className="h-4 w-4 mr-2" />
                          Watch Video
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <span className="text-4xl mb-4 block">▶️</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No YouTube videos</h3>
                  <p className="text-gray-600">No YouTube videos are available for this subject yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Multi-Platform Videos Content */}
        {platforms.map(platform => (
          <TabsContent key={platform} value={platform} className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <span>{getPlatformIcon(platform)}</span>
                  <span className="capitalize">{platform} Videos</span>
                  <Badge>{platformGroups[platform].length}</Badge>
                </h3>
              </div>
              
              {platformGroups[platform].length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {platformGroups[platform].map((video, index) => (
                    <Card key={video.id} className="shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3 mb-4">
                          <div className={`h-8 w-8 ${getPlatformColor(platform)} bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <span className={`text-${platform === 'youtube' ? 'red' : platform === 'vimeo' ? 'blue' : 'gray'}-500 font-semibold text-sm`}>
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{video.title}</h4>
                            {video.description && (
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{video.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{formatDuration(video.durationSeconds)}</span>
                          </div>
                          <Badge className={`${getPlatformColor(platform)} text-white`}>
                            <span className="capitalize">{platform}</span>
                          </Badge>
                        </div>

                        <div className="flex space-x-2">
                          <Link href={`/multi-video/${video.id}`} className="flex-1">
                            <Button className="w-full flex items-center justify-center">
                              <Play className="h-4 w-4 mr-2" />
                              Watch Video
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-3"
                            onClick={() => window.open(video.videoUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <span className="text-4xl mb-4 block">{getPlatformIcon(platform)}</span>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No {platform} videos</h3>
                    <p className="text-gray-600">No {platform} videos are available for this subject yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}