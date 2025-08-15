import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import SecureVideoEmbed from "@/components/secure-video-embed";
import { BetweenVideosAds, NativeAds } from "@/components/ads/ad-placements";
import { AppLayout } from "@/components/layout/app-layout";

import { useAdSystem } from "@/hooks/use-ad-system";
import VideoAds from "@/components/ads/video-ads";
import BetweenVideosAd from "@/components/ads/between-videos-ad";
import PromotionalVideoAd from "@/components/ads/promotional-video-ad";
import { ArrowLeft, ChevronLeft, ChevronRight, Expand, Play, Pause } from "lucide-react";
import type { Video, Subject, UserProgress } from "@shared/schema";

export default function VideoPlayer() {
  const { videoId } = useParams<{ videoId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreRollAd, setShowPreRollAd] = useState(true);
  const [showBetweenAd, setShowBetweenAd] = useState(false);
  const [showPromotionalVideoAd, setShowPromotionalVideoAd] = useState(true);
  const [videoStarted, setVideoStarted] = useState(false);
  
  // Ad system integration
  const { configs: adConfigs } = useAdSystem();

  const { data: video, isLoading: videoLoading } = useQuery<Video>({
    queryKey: [`/api/videos/${videoId}`],
    retry: false,
  });

  const { data: subject } = useQuery<Subject>({
    queryKey: [`/api/subjects/${video?.subjectId}`],
    enabled: !!video?.subjectId,
    retry: false,
  });

  const { data: subjectVideos } = useQuery<Video[]>({
    queryKey: [`/api/subjects/${video?.subjectId}/videos`],
    enabled: !!video?.subjectId,
    retry: false,
  });

  const { data: progress } = useQuery<UserProgress>({
    queryKey: [`/api/progress/${videoId}`],
    retry: false,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (progressData: { videoId: string; completed: boolean; watchTimeSeconds: number }) => {
      await apiRequest("POST", "/api/progress", progressData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${videoId}`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  const handleProgressUpdate = (watchTime: number, completed = false) => {
    if (videoId) {
      updateProgressMutation.mutate({
        videoId,
        completed,
        watchTimeSeconds: watchTime,
      });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (videoLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-lg mr-4" />
                <div>
                  <Skeleton className="h-6 w-64 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
        
        <div className="relative bg-black" style={{ paddingBottom: "56.25%", height: 0 }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading secure content...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Video not found</h3>
            <p className="text-gray-600 mb-4">The requested video could not be found.</p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentIndex = subjectVideos?.findIndex(v => v.id === videoId) ?? -1;
  const previousVideo = currentIndex > 0 ? subjectVideos?.[currentIndex - 1] : null;
  const nextVideo = currentIndex < (subjectVideos?.length ?? 0) - 1 ? subjectVideos?.[currentIndex + 1] : null;
  const progressPercentage = progress?.completed 
    ? 100 
    : video.duration 
      ? Math.round((progress?.watchTimeSeconds ?? 0) / video.duration * 100)
      : 0;

  return (
    <>
      {/* Promotional Video Ad (Pre-roll) */}
      {showPromotionalVideoAd && !videoStarted && video && (
        <PromotionalVideoAd
          key={`promo-${videoId}`}
          videoId={videoId}
          subjectId={video.subjectId}
          batchId={subject?.batchId}
          placement="pre-roll"
          onAdComplete={() => {
            setShowPromotionalVideoAd(false);
            setVideoStarted(true);
          }}
        />
      )}

      {/* Fallback Pre-roll ad system */}
      {!showPromotionalVideoAd && showPreRollAd && videoStarted && (
        <VideoAds
          type="pre-roll"
          adConfigs={adConfigs}
          onComplete={() => setShowPreRollAd(false)}
          skipAfter={5}
        />
      )}

      <div className="min-h-screen bg-black">
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href={subject ? `/batch/${subject.batchId}` : "/"}>
                <Button variant="ghost" size="sm" className="mr-4 text-white hover:bg-gray-800">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold">{video.title}</h1>
                <p className="text-sm text-gray-400">{subject?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">

              <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-gray-800">
                <Expand className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center bg-black py-8">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl border-4 border-gray-800">
            <SecureVideoEmbed 
              videoId={video.youtubeVideoId} 
              title={video.title}
              onProgress={handleProgressUpdate}
              adConfigs={adConfigs}
            />
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h2>
            {video.description && (
              <p className="text-gray-600">{video.description}</p>
            )}
            
            <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
              {video.duration && (
                <span>Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
              )}
            </div>
          </div>

          {/* Native ads between video and content */}
          <NativeAds adConfigs={adConfigs} />
          
          {/* Between videos ads */}
          <BetweenVideosAds adConfigs={adConfigs} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                {previousVideo ? (
                  <Link href={`/video/${previousVideo.id}`}>
                    <Button variant="outline" className="flex items-center">
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
                
                <div className="text-sm text-gray-500">
                  Video {currentIndex + 1} of {subjectVideos?.length}
                </div>
                
                {nextVideo ? (
                  <Button 
                    onClick={() => setShowBetweenAd(true)}
                    className="flex items-center"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <div />
                )}
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="w-full" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Course Playlist</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {subjectVideos?.map((playlistVideo, index) => (
                  <Link key={playlistVideo.id} href={`/video/${playlistVideo.id}`}>
                    <div className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      playlistVideo.id === videoId 
                        ? 'bg-white border-l-4 border-primary' 
                        : 'hover:bg-white'
                    }`}>
                      <div className={`h-8 w-8 rounded flex items-center justify-center text-sm font-medium ${
                        playlistVideo.id === videoId 
                          ? 'bg-primary text-white' 
                          : 'bg-primary bg-opacity-10 text-primary'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{playlistVideo.title}</p>
                        {playlistVideo.duration && (
                          <p className="text-xs text-gray-500">
                            {Math.floor(playlistVideo.duration / 60)}:{(playlistVideo.duration % 60).toString().padStart(2, '0')}
                          </p>
                        )}
                      </div>
                      {playlistVideo.id === videoId ? (
                        <Pause className="text-primary text-xs" size={12} />
                      ) : (
                        <Play className="text-gray-400 text-xs" size={12} />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Between Videos Ad Modal */}
    {showBetweenAd && nextVideo && (
      <BetweenVideosAd
        onAdComplete={() => {
          setShowBetweenAd(false);
          window.location.href = `/video/${nextVideo.id}`;
        }}
        onSkip={() => {
          setShowBetweenAd(false);
          window.location.href = `/video/${nextVideo.id}`;
        }}
        nextVideoTitle={nextVideo.title}
      />
    )}

    {/* Pre-roll Ad */}
    {showPreRollAd && (
      <VideoAds
        type="pre-roll"
        adConfigs={adConfigs}
        skipAfter={7}
        onComplete={() => setShowPreRollAd(false)}
        onSkip={() => setShowPreRollAd(false)}
      />
    )}
    </>
  );
}
