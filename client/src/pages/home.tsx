import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import BatchCard from "@/components/batch-card";
import GridViewToggle, { getGridClassName } from "@/components/grid-view-toggle";
import { AppLayout } from "@/components/layout/app-layout";
import { ResponsiveBannerAd } from "@/components/responsive-banner-ad";

import { useViewMode } from "@/hooks/use-view-mode";
import { GraduationCap, LogOut, Settings } from "lucide-react";
import type { Batch } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useViewMode('home-view-mode', 'grid-medium');

  const { data: batches, isLoading, error } = useQuery<Batch[]>({
    queryKey: ["/api/batches"],
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

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                  <GraduationCap className="text-white text-sm" size={16} />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Learn Here Free</h1>
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="shadow-sm">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <AppLayout pageType="home" showBannerAds={true} className="bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <GraduationCap className="text-white text-sm" size={16} />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Learn Here Free</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  <span>{(user as any)?.firstName} {(user as any)?.lastName}</span>
                </div>
                {(user as any)?.profileImageUrl && (
                  <img 
                    src={(user as any).profileImageUrl} 
                    alt="User Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
              <p className="text-gray-600">Choose your batch to continue learning</p>
            </div>
            <GridViewToggle 
              viewMode={viewMode} 
              onViewModeChange={setViewMode}
            />
          </div>
        </div>

        {batches && batches.length > 0 ? (
          <div className={getGridClassName(viewMode)}>
            {batches.map((batch) => (
              <Link key={batch.id} href={`/batch/${batch.id}`}>
                <BatchCard batch={batch} />
              </Link>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No batches available</h3>
              <p className="text-gray-600">Contact your administrator to get access to learning content.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </AppLayout>
  );
}
