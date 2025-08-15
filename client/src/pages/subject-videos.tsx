import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, ArrowLeft, Play, Clock } from "lucide-react";
import GridViewToggle, { getGridClassName } from "@/components/grid-view-toggle";
import { AppLayout } from "@/components/layout/app-layout";

import { useViewMode } from "@/hooks/use-view-mode";
import PlatformVideoTabs from "@/components/platform-video-tabs";
import type { Subject, Video, UserProgress, MultiPlatformVideo } from "@shared/schema";

export default function SubjectVideos() {
  const { batchId, subjectId } = useParams<{ batchId: string; subjectId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useViewMode('subject-videos-view-mode', 'grid-medium');

  const { data: subject } = useQuery<Subject>({
    queryKey: [`/api/subjects/${subjectId}`],
    retry: false,
  });

  const { data: videos, isLoading, error } = useQuery<Video[]>({
    queryKey: [`/api/subjects/${subjectId}/videos`],
    retry: false,
  });

  const { data: multiPlatformVideos } = useQuery<MultiPlatformVideo[]>({
    queryKey: [`/api/subjects/${subjectId}/multi-platform-videos`],
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

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-lg mr-4" />
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                  <GraduationCap className="text-white text-sm" size={16} />
                </div>
                <div>
                  <Skeleton className="h-6 w-32 mb-1" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full mb-4" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <AppLayout pageType="subject" showBannerAds={true} className="bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href={`/batch/${batchId}`}>
                <a>
                  <Button variant="ghost" size="sm" className="mr-4">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </a>
              </Link>
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <GraduationCap className="text-white text-sm" size={16} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{subject?.name}</h1>
                <p className="text-sm text-gray-500">Choose a video to start learning</p>
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
        {subject?.description && (
          <div className="mb-8 p-6 bg-white rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">About this course</h2>
            <p className="text-gray-600">{subject.description}</p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Videos</h2>
              <p className="text-gray-600">Choose a video to continue learning</p>
            </div>
          </div>
        </div>

        {/* Platform Video Tabs */}
        <PlatformVideoTabs 
          youtubeVideos={videos || []}
          multiPlatformVideos={multiPlatformVideos || []}
        />
      </main>
    </AppLayout>
  );
}