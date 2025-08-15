import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ResponsiveBannerAd } from "@/components/responsive-banner-ad";
import { MobileResponsiveAd } from "@/components/mobile-responsive-ad";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import BatchSubjects from "@/pages/batch-subjects";
import SubjectVideos from "@/pages/subject-videos";
import VideoPlayer from "@/pages/video-player";
import MultiVideoViewer from "@/pages/multi-video-viewer";
import AdminDashboard from "@/pages/admin-dashboard";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/batch/:batchId" component={BatchSubjects} />
          <Route path="/batch/:batchId/course/:courseId" component={BatchSubjects} />
          <Route path="/batch/:batchId/subject/:subjectId" component={SubjectVideos} />
          <Route path="/batch/:batchId/course/:courseId/subject/:subjectId" component={SubjectVideos} />
          <Route path="/video/:videoId" component={VideoPlayer} />
          <Route path="/multi-video/:videoId" component={MultiVideoViewer} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin-dashboard" component={AdminDashboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen pb-16"> {/* Add padding bottom for banner ad */}
      <Toaster />
      <Router />
      
      {/* Show banner ads only on main website pages (not admin) */}
      {isAuthenticated && !window.location.pathname.startsWith('/admin') && (
        <>
          <ResponsiveBannerAd placement="global-bottom" pageType="global" />
          <MobileResponsiveAd placement="global-mobile" pageType="global" position="bottom" />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
