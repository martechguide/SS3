import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, GraduationCap } from "lucide-react";
import MultiPlatformVideoEmbed from "@/components/multi-platform-video-embed";
import { AppLayout } from "@/components/layout/app-layout";

import type { MultiPlatformVideo, Subject } from "@shared/schema";

export default function MultiVideoViewer() {
  const { videoId } = useParams<{ videoId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: video, isLoading, error } = useQuery<MultiPlatformVideo>({
    queryKey: [`/api/multi-platform-videos/${videoId}`],
    retry: false,
  });

  const { data: subject } = useQuery<Subject>({
    queryKey: [`/api/subjects/${video?.subjectId}`],
    enabled: !!video?.subjectId,
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center py-12 max-w-md">
          <CardContent>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Video not found</h3>
            <p className="text-gray-600 mb-4">The video you're looking for doesn't exist or you don't have access to it.</p>
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AppLayout pageType="multi-video" showBannerAds={true} className="bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {subject && (
                <Link href={`/batch/${subject.batchId}/subject/${subject.id}`}>
                  <Button variant="ghost" size="sm" className="mr-4">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <GraduationCap className="text-white text-sm" size={16} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{video.title}</h1>
                <p className="text-sm text-gray-500 capitalize">{video.platform} Video</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {(user as any)?.profileImageUrl && (
                <img 
                  src={(user as any).profileImageUrl} 
                  alt="User Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <MultiPlatformVideoEmbed
              platform={video.platform as any}
              videoId={video.videoId!}
              videoUrl={video.videoUrl}
              title={video.title}
              className="w-full"
            />
            
            {/* Video Description */}
            {video.description && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3">About this video</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{video.description}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Video Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Platform</span>
                    <p className="text-gray-900 capitalize flex items-center mt-1">
                      <span className="mr-2">
                        {video.platform === 'youtube' && '▶️'}
                        {video.platform === 'vimeo' && '🎬'}
                        {video.platform === 'facebook' && '📘'}
                        {video.platform === 'dailymotion' && '🎥'}
                        {video.platform === 'twitch' && '🎮'}
                        {video.platform === 'peertube' && '🔗'}
                      </span>
                      {video.platform}
                    </p>
                  </div>

                  {video.durationSeconds && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Duration</span>
                      <p className="text-gray-900 mt-1">
                        {Math.floor(video.durationSeconds / 60)}:{(video.durationSeconds % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-sm font-medium text-gray-500">Order</span>
                    <p className="text-gray-900 mt-1">Video #{video.orderIndex + 1}</p>
                  </div>

                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(video.videoUrl, '_blank')}
                    >
                      Open on {video.platform}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subject Info */}
            {subject && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Subject</h3>
                  <p className="text-gray-900 font-medium">{subject.name}</p>
                  {subject.description && (
                    <p className="text-gray-600 mt-2 text-sm">{subject.description}</p>
                  )}
                  
                  <Link href={`/batch/${subject.batchId}/subject/${subject.id}`} className="block mt-4">
                    <Button variant="outline" className="w-full">
                      Back to Subject
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  );
}