import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Users, PlayCircle, DollarSign, Ban, Check, Info, Plus, Edit2, Trash2, FolderOpen, Video, ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import AdminAds from "./admin/ads";
import BrandPromotions from "./admin/brand-promotions";
import BannerAdsControl from "@/components/admin/banner-ads-control";
import type { Batch, Course, Subject, Video as VideoType, AdSettings, InsertBatch, InsertCourse, InsertSubject, InsertVideo, MultiPlatformVideo, InsertMultiPlatformVideo } from "@shared/schema";
import { extractYouTubeVideoId } from "@/lib/youtube-utils";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("batches");
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  // Dialog states
  const [isCreateBatchDialogOpen, setIsCreateBatchDialogOpen] = useState(false);
  const [isEditBatchDialogOpen, setIsEditBatchDialogOpen] = useState(false);
  const [isCreateCourseDialogOpen, setIsCreateCourseDialogOpen] = useState(false);
  const [isEditCourseDialogOpen, setIsEditCourseDialogOpen] = useState(false);
  const [isCreateSubjectDialogOpen, setIsCreateSubjectDialogOpen] = useState(false);
  const [isCreateVideoDialogOpen, setIsCreateVideoDialogOpen] = useState(false);
  const [isCreatePlatformVideoDialogOpen, setIsCreatePlatformVideoDialogOpen] = useState(false);
  
  // Form states
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoType | null>(null);
  const [isEditSubjectDialogOpen, setIsEditSubjectDialogOpen] = useState(false);
  const [isEditVideoDialogOpen, setIsEditVideoDialogOpen] = useState(false);
  
  const [batchForm, setBatchForm] = useState({
    name: "",
    description: "",
    thumbnailUrl: "",
    isActive: true
  });
  const [courseForm, setCourseForm] = useState({
    name: "",
    description: "",
    thumbnailUrl: "",
    orderIndex: 0,
    isActive: true
  });
  
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    description: "",
    orderIndex: 0
  });
  const [videoForm, setVideoForm] = useState({
    title: "",
    description: "",
    youtubeVideoId: "",
    duration: 0,
    orderIndex: 0
  });
  
  const [platformVideoForm, setPlatformVideoForm] = useState({
    title: "",
    description: "",
    platform: "vimeo" as const,
    videoId: "",
    videoUrl: "",
    duration: 0,
    orderIndex: 0
  });

  // Queries
  const { data: batches = [], isLoading: batchesLoading } = useQuery<Batch[]>({
    queryKey: ["/api/batches"],
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/batches", selectedBatch?.id, "courses"],
    enabled: !!selectedBatch?.id,
  });

  const { data: subjects = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ["/api/courses", selectedCourse?.id, "subjects"],
    enabled: !!selectedCourse?.id,
  });

  const { data: videos = [], isLoading: videosLoading } = useQuery<VideoType[]>({
    queryKey: ["/api/subjects", selectedSubject?.id, "videos"],
    enabled: !!selectedSubject?.id,
  });

  const { data: adSettings, isLoading: adSettingsLoading } = useQuery<AdSettings>({
    queryKey: ["/api/admin/ads"],
  });

  const { data: platformVideos = [], isLoading: platformVideosLoading } = useQuery<MultiPlatformVideo[]>({
    queryKey: ["/api/multi-platform-videos"],
  });

  // Batch mutations
  const createBatchMutation = useMutation({
    mutationFn: async (batchData: InsertBatch) => {
      await apiRequest("POST", "/api/batches", batchData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      setIsCreateBatchDialogOpen(false);
      setBatchForm({ name: "", description: "", thumbnailUrl: "", isActive: true });
      toast({
        title: "Success",
        description: "Batch created successfully",
      });
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
      } else {
        toast({
          title: "Error",
          description: "Failed to create batch",
          variant: "destructive",
        });
      }
    },
  });

  const updateBatchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertBatch> }) => {
      await apiRequest("PATCH", `/api/batches/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      setIsEditBatchDialogOpen(false);
      setEditingBatch(null);
      setBatchForm({ name: "", description: "", thumbnailUrl: "", isActive: true });
      toast({
        title: "Success",
        description: "Batch updated successfully",
      });
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
      } else {
        toast({
          title: "Error",
          description: "Failed to update batch",
          variant: "destructive",
        });
      }
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: async (batchId: string) => {
      await apiRequest("DELETE", `/api/batches/${batchId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      toast({
        title: "Success",
        description: "Batch deleted successfully",
      });
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
      } else {
        toast({
          title: "Error",
          description: "Failed to delete batch",
          variant: "destructive",
        });
      }
    },
  });

  // Course mutations
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: InsertCourse) => {
      await apiRequest("POST", `/api/batches/${selectedBatch?.id}/courses`, courseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches", selectedBatch?.id, "courses"] });
      setIsCreateCourseDialogOpen(false);
      setCourseForm({ name: "", description: "", thumbnailUrl: "", orderIndex: 0, isActive: true });
      toast({
        title: "Success",
        description: "Course created successfully",
      });
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
      } else {
        toast({
          title: "Error",
          description: "Failed to create course",
          variant: "destructive",
        });
      }
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCourse> }) => {
      await apiRequest("PATCH", `/api/courses/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches", selectedBatch?.id, "courses"] });
      setIsEditCourseDialogOpen(false);
      setEditingCourse(null);
      setCourseForm({ name: "", description: "", thumbnailUrl: "", orderIndex: 0, isActive: true });
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
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
      } else {
        toast({
          title: "Error",
          description: "Failed to update course",
          variant: "destructive",
        });
      }
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      await apiRequest("DELETE", `/api/courses/${courseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches", selectedBatch?.id, "courses"] });
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
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
      } else {
        toast({
          title: "Error",
          description: "Failed to delete course",
          variant: "destructive",
        });
      }
    },
  });

  // Subject mutations
  const createSubjectMutation = useMutation({
    mutationFn: async (subjectData: InsertSubject) => {
      await apiRequest("POST", `/api/courses/${selectedCourse?.id}/subjects`, subjectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", selectedCourse?.id, "subjects"] });
      setIsCreateSubjectDialogOpen(false);
      setSubjectForm({ name: "", description: "", orderIndex: 0 });
      toast({
        title: "Success",
        description: "Subject created successfully",
      });
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
      } else {
        toast({
          title: "Error",
          description: "Failed to create subject",
          variant: "destructive",
        });
      }
    },
  });

  // Subject edit/delete mutations
  const updateSubjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertSubject> }) => {
      await apiRequest("PATCH", `/api/subjects/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", selectedCourse?.id, "subjects"] });
      setIsEditSubjectDialogOpen(false);
      setEditingSubject(null);
      setSubjectForm({ name: "", description: "", orderIndex: 0 });
      toast({
        title: "Success",
        description: "Subject updated successfully",
      });
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
      } else {
        toast({
          title: "Error",
          description: "Failed to update subject",
          variant: "destructive",
        });
      }
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (subjectId: string) => {
      await apiRequest("DELETE", `/api/subjects/${subjectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", selectedCourse?.id, "subjects"] });
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
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
      } else {
        toast({
          title: "Error",
          description: "Failed to delete subject",
          variant: "destructive",
        });
      }
    },
  });

  // Video mutations
  const createVideoMutation = useMutation({
    mutationFn: async (videoData: InsertVideo) => {
      await apiRequest("POST", `/api/subjects/${selectedSubject?.id}/videos`, videoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects", selectedSubject?.id, "videos"] });
      setIsCreateVideoDialogOpen(false);
      setVideoForm({ title: "", description: "", youtubeVideoId: "", duration: 0, orderIndex: 0 });
      toast({
        title: "Success",
        description: "Video created successfully",
      });
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
      } else {
        toast({
          title: "Error",
          description: "Failed to create video",
          variant: "destructive",
        });
      }
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertVideo> }) => {
      await apiRequest("PATCH", `/api/videos/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects", selectedSubject?.id, "videos"] });
      setIsEditVideoDialogOpen(false);
      setEditingVideo(null);
      setVideoForm({ title: "", description: "", youtubeVideoId: "", duration: 0, orderIndex: 0 });
      toast({
        title: "Success",
        description: "Video updated successfully",
      });
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
      } else {
        toast({
          title: "Error",
          description: "Failed to update video",
          variant: "destructive",
        });
      }
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: string) => {
      await apiRequest("DELETE", `/api/videos/${videoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects", selectedSubject?.id, "videos"] });
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
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
      } else {
        toast({
          title: "Error",
          description: "Failed to delete video",
          variant: "destructive",
        });
      }
    },
  });

  // Platform video mutations
  const createPlatformVideoMutation = useMutation({
    mutationFn: async (videoData: InsertMultiPlatformVideo) => {
      await apiRequest("POST", "/api/multi-platform-videos", videoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/multi-platform-videos"] });
      setIsCreatePlatformVideoDialogOpen(false);
      setPlatformVideoForm({ 
        title: "", 
        description: "", 
        platform: "vimeo" as const, 
        videoId: "", 
        videoUrl: "", 
        duration: 0, 
        orderIndex: 0 
      });
      toast({
        title: "Success",
        description: "Platform video created successfully",
      });
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
      } else {
        toast({
          title: "Error",
          description: "Failed to create platform video",
          variant: "destructive",
        });
      }
    },
  });

  // Ad settings mutation
  const updateAdSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<AdSettings>) => {
      await apiRequest("PATCH", "/api/admin/ads", settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      toast({
        title: "Success",
        description: "Ad settings updated successfully",
      });
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
      } else {
        toast({
          title: "Error",
          description: "Failed to update ad settings",
          variant: "destructive",
        });
      }
    },
  });

  // Handler functions
  const handleCreateBatch = () => {
    if (!batchForm.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a batch name",
        variant: "destructive",
      });
      return;
    }
    
    createBatchMutation.mutate({
      name: batchForm.name,
      description: batchForm.description || null,
      thumbnailUrl: batchForm.thumbnailUrl || null,
      isActive: batchForm.isActive,
    });
  };

  const handleEditBatch = (batch: Batch) => {
    setEditingBatch(batch);
    setBatchForm({
      name: batch.name,
      description: batch.description || "",
      thumbnailUrl: batch.thumbnailUrl || "",
      isActive: batch.isActive ?? true,
    });
    setIsEditBatchDialogOpen(true);
  };

  const handleUpdateBatch = () => {
    if (!editingBatch || !batchForm.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a batch name",
        variant: "destructive",
      });
      return;
    }
    
    updateBatchMutation.mutate({
      id: editingBatch.id,
      data: {
        name: batchForm.name,
        description: batchForm.description || null,
        thumbnailUrl: batchForm.thumbnailUrl || null,
        isActive: batchForm.isActive,
      },
    });
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectForm({
      name: subject.name,
      description: subject.description || "",
      orderIndex: subject.orderIndex || 0,
    });
    setIsEditSubjectDialogOpen(true);
  };

  const handleUpdateSubject = () => {
    if (!editingSubject || !subjectForm.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subject name",
        variant: "destructive",
      });
      return;
    }
    
    updateSubjectMutation.mutate({
      id: editingSubject.id,
      data: {
        name: subjectForm.name,
        description: subjectForm.description || null,
        orderIndex: subjectForm.orderIndex,
      },
    });
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (confirm("Are you sure you want to delete this subject? This will also delete all videos in this subject.")) {
      deleteSubjectMutation.mutate(subjectId);
    }
  };

  const handleEditVideo = (video: VideoType) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title,
      description: video.description || "",
      youtubeVideoId: video.youtubeVideoId,
      duration: video.duration || 0,
      orderIndex: video.orderIndex || 0,
    });
    setIsEditVideoDialogOpen(true);
  };

  const handleUpdateVideo = () => {
    if (!editingVideo || !videoForm.title.trim() || !videoForm.youtubeVideoId.trim()) {
      toast({
        title: "Error",
        description: "Please enter video title and YouTube video ID",
        variant: "destructive",
      });
      return;
    }

    // Extract video ID from URL if needed
    const { videoId, isValid } = extractYouTubeVideoId(videoForm.youtubeVideoId);
    
    if (!isValid || !videoId) {
      toast({
        title: "Invalid YouTube URL",
        description: "Please enter a valid YouTube URL or video ID",
        variant: "destructive",
      });
      return;
    }
    
    updateVideoMutation.mutate({
      id: editingVideo.id,
      data: {
        title: videoForm.title,
        description: videoForm.description || null,
        youtubeVideoId: videoId,
        duration: videoForm.duration || null,
        orderIndex: videoForm.orderIndex,
      },
    });
  };

  const handleDeleteVideo = (videoId: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
      deleteVideoMutation.mutate(videoId);
    }
  };

  const handleDeleteBatch = (batchId: string) => {
    if (confirm("Are you sure you want to delete this batch? This action cannot be undone.")) {
      deleteBatchMutation.mutate(batchId);
    }
  };

  // Course handler functions
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.name.trim()) {
      toast({
        title: "Error",
        description: "Course name is required",
        variant: "destructive",
      });
      return;
    }
    createCourseMutation.mutate({
      ...courseForm,
      batchId: selectedBatch!.id
    });
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      description: course.description || "",
      thumbnailUrl: course.thumbnailUrl || "",
      orderIndex: course.orderIndex ?? 0,
      isActive: course.isActive ?? true
    });
    setIsEditCourseDialogOpen(true);
  };

  const handleUpdateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    updateCourseMutation.mutate({ id: editingCourse.id, data: courseForm });
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm("Are you sure you want to delete this course? This will also delete all subjects and videos in this course.")) {
      deleteCourseMutation.mutate(courseId);
    }
  };

  const handleCreateSubject = () => {
    if (!subjectForm.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subject name",
        variant: "destructive",
      });
      return;
    }
    
    createSubjectMutation.mutate({
      name: subjectForm.name,
      description: subjectForm.description || null,
      batchId: selectedCourse?.batchId || selectedBatch!.id,
      courseId: selectedCourse?.id || null,
      orderIndex: subjectForm.orderIndex,
    });
  };

  const handleCreateVideo = () => {
    if (!videoForm.title.trim() || !videoForm.youtubeVideoId.trim()) {
      toast({
        title: "Error",
        description: "Please enter video title and YouTube video ID",
        variant: "destructive",
      });
      return;
    }

    // Extract video ID from URL if needed
    const { videoId, isValid } = extractYouTubeVideoId(videoForm.youtubeVideoId);
    
    if (!isValid || !videoId) {
      toast({
        title: "Invalid YouTube URL",
        description: "Please enter a valid YouTube URL or video ID",
        variant: "destructive",
      });
      return;
    }
    
    createVideoMutation.mutate({
      title: videoForm.title,
      description: videoForm.description || null,
      youtubeVideoId: videoId,
      duration: videoForm.duration || null,
      subjectId: selectedSubject?.id || null,
      courseId: selectedCourse?.id || null,
      batchId: selectedBatch!.id,
      orderIndex: videoForm.orderIndex,
      isActive: true,
    });
  };

  const handleAdToggle = (setting: keyof AdSettings, enabled: boolean) => {
    updateAdSettingsMutation.mutate({ [setting]: enabled });
  };

  const disableAllAds = () => {
    updateAdSettingsMutation.mutate({
      rewardedAdsEnabled: false,
      bannerAdsEnabled: false,
      interstitialAdsEnabled: false,
    });
  };

  const enableAllAds = () => {
    updateAdSettingsMutation.mutate({
      rewardedAdsEnabled: true,
      bannerAdsEnabled: true,
      interstitialAdsEnabled: true,
    });
  };

  const handleCreatePlatformVideo = () => {
    if (!platformVideoForm.title.trim() || !platformVideoForm.videoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter video title and URL",
        variant: "destructive",
      });
      return;
    }

    createPlatformVideoMutation.mutate({
      title: platformVideoForm.title,
      description: platformVideoForm.description || null,
      platform: platformVideoForm.platform,
      videoId: platformVideoForm.videoId || "",
      videoUrl: platformVideoForm.videoUrl,
      durationSeconds: platformVideoForm.duration || null,
      subjectId: selectedSubject?.id || null,
      courseId: selectedCourse?.id || null,
      batchId: selectedBatch!.id,
      orderIndex: platformVideoForm.orderIndex,
      isActive: true,
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage content and settings</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Admin</Badge>
                <span className="text-sm text-gray-600">{(user as any)?.email || 'Admin User'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Card className="bg-white shadow">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 px-6">
              <TabsList className="h-auto p-0 bg-transparent">
                <div className="flex space-x-8">
                  <TabsTrigger 
                    value="batches" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-1 py-4"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Content Management
                  </TabsTrigger>
                  <TabsTrigger 
                    value="multi-platform" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-1 py-4"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Multi-Platform Videos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="ads" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-1 py-4"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Advertisement Settings
                  </TabsTrigger>
                  <TabsTrigger 
                    value="brand-promotions" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-1 py-4"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Brand Partnerships
                  </TabsTrigger>
                  <TabsTrigger 
                    value="banner-ads" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-1 py-4"
                  >
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Banner Ads
                  </TabsTrigger>
                </div>
              </TabsList>
            </div>

            <TabsContent value="batches" className="p-6 mt-0">
              {/* Navigation Breadcrumbs */}
              <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
                <button 
                  className={`hover:text-blue-600 ${!selectedBatch ? 'font-semibold text-gray-900' : ''}`}
                  onClick={() => { setSelectedBatch(null); setSelectedCourse(null); setSelectedSubject(null); }}
                >
                  Batches
                </button>
                {selectedBatch && (
                  <>
                    <span>/</span>
                    <button 
                      className={`hover:text-blue-600 ${!selectedCourse ? 'font-semibold text-gray-900' : ''}`}
                      onClick={() => { setSelectedCourse(null); setSelectedSubject(null); }}
                    >
                      {selectedBatch.name}
                    </button>
                  </>
                )}
                {selectedCourse && (
                  <>
                    <span>/</span>
                    <button 
                      className={`hover:text-blue-600 ${!selectedSubject ? 'font-semibold text-gray-900' : ''}`}
                      onClick={() => setSelectedSubject(null)}
                    >
                      {selectedCourse.name}
                    </button>
                  </>
                )}
                {selectedSubject && (
                  <>
                    <span>/</span>
                    <span className="font-semibold text-gray-900">{selectedSubject.name}</span>
                  </>
                )}
              </div>

              {/* Content based on selection */}
              {!selectedBatch ? (
                // Batch list view
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Manage Batches</h3>
                    <Dialog open={isCreateBatchDialogOpen} onOpenChange={setIsCreateBatchDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-blue-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Batch
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Create New Batch</DialogTitle>
                          <DialogDescription>
                            Create a new learning batch. You can add subjects and videos later.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                              Name
                            </Label>
                            <Input
                              id="name"
                              value={batchForm.name}
                              onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                              className="col-span-3"
                              placeholder="e.g., Advanced Mathematics"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                              Description
                            </Label>
                            <Textarea
                              id="description"
                              value={batchForm.description}
                              onChange={(e) => setBatchForm({ ...batchForm, description: e.target.value })}
                              className="col-span-3"
                              placeholder="Brief description of the batch..."
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="thumbnailUrl" className="text-right">
                              Thumbnail URL
                            </Label>
                            <Input
                              id="thumbnailUrl"
                              value={batchForm.thumbnailUrl}
                              onChange={(e) => setBatchForm({ ...batchForm, thumbnailUrl: e.target.value })}
                              className="col-span-3"
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="isActive" className="text-right">
                              Active
                            </Label>
                            <Switch
                              id="isActive"
                              checked={batchForm.isActive}
                              onCheckedChange={(checked) => setBatchForm({ ...batchForm, isActive: checked })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            onClick={handleCreateBatch}
                            disabled={createBatchMutation.isPending}
                          >
                            {createBatchMutation.isPending ? "Creating..." : "Create Batch"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {batchesLoading ? (
                    <div className="grid gap-4">
                      {[...Array(3)].map((_, i) => (
                        <Card key={i} className="border border-gray-200">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <Skeleton className="h-6 w-48 mb-2" />
                                <Skeleton className="h-4 w-64 mb-4" />
                                <div className="flex items-center space-x-2">
                                  <Skeleton className="h-6 w-16" />
                                  <Skeleton className="h-4 w-32" />
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-8 w-16" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {batches.map((batch: Batch) => (
                        <Card key={batch.id} className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex space-x-4 flex-1">
                                {batch.thumbnailUrl && (
                                  <div className="flex-shrink-0">
                                    <img 
                                      src={batch.thumbnailUrl} 
                                      alt={batch.name}
                                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                                <div 
                                  className="flex-1 cursor-pointer"
                                  onClick={() => setSelectedBatch(batch)}
                                >
                                  <div className="flex items-center space-x-2 mb-2">
                                    <FolderOpen className="h-5 w-5 text-blue-600" />
                                    <h4 className="text-lg font-medium text-gray-900">{batch.name}</h4>
                                  </div>
                                  {batch.description && (
                                    <p className="text-gray-600 text-sm mb-3">{batch.description}</p>
                                  )}
                                  <div className="flex items-center space-x-2">
                                    <Badge variant={batch.isActive ? "default" : "secondary"}>
                                      {batch.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                      Created {new Date(batch.createdAt!).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2 flex-wrap gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBatch(batch);
                                  }}
                                >
                                  <FolderOpen className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBatch(batch);
                                    setSelectedSubject(null);
                                    setIsCreateVideoDialogOpen(true);
                                  }}
                                >
                                  <Video className="h-4 w-4 mr-1" />
                                  Add YT Video
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBatch(batch);
                                    setSelectedSubject(null);
                                    setIsCreatePlatformVideoDialogOpen(true);
                                  }}
                                >
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Add Platform Video
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditBatch(batch);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteBatch(batch.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ) : !selectedCourse ? (
                // Course list view
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedBatch(null)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                      </Button>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Courses in {selectedBatch.name}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog open={isCreateCourseDialogOpen} onOpenChange={setIsCreateCourseDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-primary hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Course
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Create New Course</DialogTitle>
                            <DialogDescription>
                              Create a new course folder within {selectedBatch.name}.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleCreateCourse}>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="course-name" className="text-right">
                                  Name
                                </Label>
                                <Input
                                  id="course-name"
                                  value={courseForm.name}
                                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                                  className="col-span-3"
                                  placeholder="e.g., Advanced Mathematics"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="course-description" className="text-right">
                                  Description
                                </Label>
                                <Textarea
                                  id="course-description"
                                  value={courseForm.description}
                                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                  className="col-span-3"
                                  placeholder="Brief description of the course..."
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="course-thumbnail" className="text-right">
                                  Thumbnail URL
                                </Label>
                                <Input
                                  id="course-thumbnail"
                                  value={courseForm.thumbnailUrl}
                                  onChange={(e) => setCourseForm({ ...courseForm, thumbnailUrl: e.target.value })}
                                  className="col-span-3"
                                  placeholder="https://example.com/image.jpg"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="course-order" className="text-right">
                                  Order
                                </Label>
                                <Input
                                  id="course-order"
                                  type="number"
                                  value={courseForm.orderIndex}
                                  onChange={(e) => setCourseForm({ ...courseForm, orderIndex: parseInt(e.target.value) || 0 })}
                                  className="col-span-3"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                type="submit" 
                                disabled={createCourseMutation.isPending}
                              >
                                {createCourseMutation.isPending ? "Creating..." : "Create Course"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  
                  {coursesLoading ? (
                    <div className="grid gap-4">
                      {[...Array(3)].map((_, i) => (
                        <Card key={i} className="border border-gray-200">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <Skeleton className="h-6 w-48 mb-2" />
                                <Skeleton className="h-4 w-64 mb-4" />
                              </div>
                              <div className="flex space-x-2">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-8 w-16" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {courses.map((course: Course) => (
                        <Card key={course.id} className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex space-x-4 flex-1">
                                {course.thumbnailUrl && (
                                  <div className="flex-shrink-0">
                                    <img 
                                      src={course.thumbnailUrl} 
                                      alt={course.name}
                                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                                <div 
                                  className="flex-1 cursor-pointer"
                                  onClick={() => setSelectedCourse(course)}
                                >
                                  <div className="flex items-center space-x-2 mb-2">
                                    <FolderOpen className="h-5 w-5 text-purple-600" />
                                    <h4 className="text-lg font-medium text-gray-900">{course.name}</h4>
                                  </div>
                                  {course.description && (
                                    <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                                  )}
                                  <div className="flex items-center space-x-2">
                                    <Badge variant={course.isActive ? "default" : "secondary"}>
                                      {course.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                      Order: {course.orderIndex}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2 flex-wrap gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCourse(course);
                                  }}
                                >
                                  <FolderOpen className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBatch(selectedBatch);
                                    setSelectedCourse(course);
                                    setSelectedSubject(null);
                                    setIsCreateVideoDialogOpen(true);
                                  }}
                                >
                                  <Video className="h-4 w-4 mr-1" />
                                  Add YT Video
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBatch(selectedBatch);
                                    setSelectedCourse(course);
                                    setSelectedSubject(null);
                                    setIsCreatePlatformVideoDialogOpen(true);
                                  }}
                                >
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Add Platform Video
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditCourse(course);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCourse(course.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {courses.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No courses found. Create the first course to get started.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : !selectedSubject ? (
                // Subject list view
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedCourse(null)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                      </Button>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Subjects in {selectedCourse.name}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog open={isCreateSubjectDialogOpen} onOpenChange={setIsCreateSubjectDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-primary hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Subject
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Create New Subject</DialogTitle>
                          <DialogDescription>
                            Create a new subject folder within {selectedCourse.name}.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subject-name" className="text-right">
                              Name
                            </Label>
                            <Input
                              id="subject-name"
                              value={subjectForm.name}
                              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                              className="col-span-3"
                              placeholder="e.g., Calculus Basics"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subject-description" className="text-right">
                              Description
                            </Label>
                            <Textarea
                              id="subject-description"
                              value={subjectForm.description}
                              onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                              className="col-span-3"
                              placeholder="Brief description of the subject..."
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subject-order" className="text-right">
                              Order
                            </Label>
                            <Input
                              id="subject-order"
                              type="number"
                              value={subjectForm.orderIndex}
                              onChange={(e) => setSubjectForm({ ...subjectForm, orderIndex: parseInt(e.target.value) || 0 })}
                              className="col-span-3"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            onClick={handleCreateSubject}
                            disabled={createSubjectMutation.isPending}
                          >
                            {createSubjectMutation.isPending ? "Creating..." : "Create Subject"}
                          </Button>
                        </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  
                  {subjectsLoading ? (
                    <div className="grid gap-4">
                      {[...Array(3)].map((_, i) => (
                        <Card key={i} className="border border-gray-200">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <Skeleton className="h-6 w-48 mb-2" />
                                <Skeleton className="h-4 w-64 mb-4" />
                              </div>
                              <div className="flex space-x-2">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-8 w-16" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {subjects.map((subject: Subject) => (
                        <Card key={subject.id} className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div 
                                className="flex-1"
                                onClick={() => setSelectedSubject(subject)}
                              >
                                <div className="flex items-center space-x-2 mb-2">
                                  <FolderOpen className="h-5 w-5 text-green-600" />
                                  <h4 className="text-lg font-medium text-gray-900">{subject.name}</h4>
                                </div>
                                {subject.description && (
                                  <p className="text-gray-600 text-sm mb-3">{subject.description}</p>
                                )}
                                <span className="text-sm text-gray-500">
                                  Order: {subject.orderIndex}
                                </span>
                              </div>
                              <div className="flex space-x-2 flex-wrap gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSubject(subject);
                                  }}
                                >
                                  <FolderOpen className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSubject(subject);
                                    setIsCreateVideoDialogOpen(true);
                                  }}
                                >
                                  <Video className="h-4 w-4 mr-1" />
                                  Add YT Video
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSubject(subject);
                                    setIsCreatePlatformVideoDialogOpen(true);
                                  }}
                                >
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Add Platform Video
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSubject(subject);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSubject(subject.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {subjects.length === 0 && (
                        <div className="text-center py-12">
                          <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600">No subjects created yet. Create your first subject to get started.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // Video list view
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedSubject(null)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                      </Button>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Videos in {selectedSubject.name}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog open={isCreateVideoDialogOpen} onOpenChange={setIsCreateVideoDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200">
                            <Video className="h-4 w-4 mr-2" />
                            Add YouTube Video
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                          <DialogTitle>Add New Video</DialogTitle>
                          <DialogDescription>
                            Add an unlisted YouTube video to {selectedSubject.name}.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="video-title" className="text-right">
                              Title
                            </Label>
                            <Input
                              id="video-title"
                              value={videoForm.title}
                              onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                              className="col-span-3"
                              placeholder="e.g., Introduction to Functions"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="video-description" className="text-right">
                              Description
                            </Label>
                            <Textarea
                              id="video-description"
                              value={videoForm.description}
                              onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                              className="col-span-3"
                              placeholder="Brief description of the video content..."
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="video-id" className="text-right">
                              YouTube URL/ID
                            </Label>
                            <div className="col-span-3 space-y-2">
                              <Input
                                id="video-id"
                                value={videoForm.youtubeVideoId}
                                onChange={(e) => setVideoForm({ ...videoForm, youtubeVideoId: e.target.value })}
                                placeholder="Paste any YouTube URL or Video ID"
                              />
                              <p className="text-xs text-gray-500">
                                Accepts: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/..., or just the video ID
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="video-duration" className="text-right">
                              Duration (min)
                            </Label>
                            <Input
                              id="video-duration"
                              type="number"
                              value={videoForm.duration}
                              onChange={(e) => setVideoForm({ ...videoForm, duration: parseInt(e.target.value) || 0 })}
                              className="col-span-3"
                              placeholder="0"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="video-order" className="text-right">
                              Order
                            </Label>
                            <Input
                              id="video-order"
                              type="number"
                              value={videoForm.orderIndex}
                              onChange={(e) => setVideoForm({ ...videoForm, orderIndex: parseInt(e.target.value) || 0 })}
                              className="col-span-3"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            onClick={handleCreateVideo}
                            disabled={createVideoMutation.isPending}
                          >
                            {createVideoMutation.isPending ? "Adding..." : "Add Video"}
                          </Button>
                        </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog open={isCreatePlatformVideoDialogOpen} onOpenChange={setIsCreatePlatformVideoDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200">
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Add Platform Video
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px]">
                          <DialogHeader>
                            <DialogTitle>Add Platform Video</DialogTitle>
                            <DialogDescription>
                              Add a video from Facebook, Vimeo, Dailymotion, Twitch, or Telegram.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="platform-video-title" className="text-right">
                                Title
                              </Label>
                              <Input
                                id="platform-video-title"
                                value={platformVideoForm.title}
                                onChange={(e) => setPlatformVideoForm({ ...platformVideoForm, title: e.target.value })}
                                className="col-span-3"
                                placeholder="e.g., Introduction to Functions"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="platform-video-description" className="text-right">
                                Description
                              </Label>
                              <Textarea
                                id="platform-video-description"
                                value={platformVideoForm.description}
                                onChange={(e) => setPlatformVideoForm({ ...platformVideoForm, description: e.target.value })}
                                className="col-span-3"
                                placeholder="Brief description of the video content..."
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="platform-type" className="text-right">
                                Platform
                              </Label>
                              <Select 
                                value={platformVideoForm.platform} 
                                onValueChange={(value) => setPlatformVideoForm({ ...platformVideoForm, platform: value as "facebook" | "vimeo" | "dailymotion" | "twitch" | "telegram" })}
                              >
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Select video platform" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="facebook">Facebook</SelectItem>
                                  <SelectItem value="vimeo">Vimeo</SelectItem>
                                  <SelectItem value="dailymotion">Dailymotion</SelectItem>
                                  <SelectItem value="twitch">Twitch</SelectItem>
                                  <SelectItem value="telegram">Telegram</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="platform-video-url" className="text-right">
                                Video URL
                              </Label>
                              <div className="col-span-3 space-y-2">
                                <Input
                                  id="platform-video-url"
                                  value={platformVideoForm.videoUrl}
                                  onChange={(e) => setPlatformVideoForm({ ...platformVideoForm, videoUrl: e.target.value })}
                                  placeholder="Paste the full video URL"
                                />
                                <p className="text-xs text-gray-500">
                                  Paste the complete URL from the platform (e.g., facebook.com/watch?v=..., vimeo.com/...)
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="platform-video-duration" className="text-right">
                                Duration (min)
                              </Label>
                              <Input
                                id="platform-video-duration"
                                type="number"
                                value={platformVideoForm.duration}
                                onChange={(e) => setPlatformVideoForm({ ...platformVideoForm, duration: parseInt(e.target.value) || 0 })}
                                className="col-span-3"
                                placeholder="0"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="platform-video-order" className="text-right">
                                Order
                              </Label>
                              <Input
                                id="platform-video-order"
                                type="number"
                                value={platformVideoForm.orderIndex}
                                onChange={(e) => setPlatformVideoForm({ ...platformVideoForm, orderIndex: parseInt(e.target.value) || 0 })}
                                className="col-span-3"
                                placeholder="0"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              type="submit" 
                              onClick={handleCreatePlatformVideo}
                              disabled={createPlatformVideoMutation.isPending}
                            >
                              {createPlatformVideoMutation.isPending ? "Adding..." : "Add Platform Video"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  
                  {videosLoading ? (
                    <div className="grid gap-4">
                      {[...Array(3)].map((_, i) => (
                        <Card key={i} className="border border-gray-200">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <Skeleton className="h-6 w-48 mb-2" />
                                <Skeleton className="h-4 w-64 mb-4" />
                              </div>
                              <div className="flex space-x-2">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-8 w-16" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {videos.map((video: VideoType) => (
                        <Card key={video.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Video className="h-5 w-5 text-red-600" />
                                  <h4 className="text-lg font-medium text-gray-900">{video.title}</h4>
                                </div>
                                {video.description && (
                                  <p className="text-gray-600 text-sm mb-3">{video.description}</p>
                                )}
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>Order: {video.orderIndex}</span>
                                  {video.duration && <span>Duration: {video.duration} min</span>}
                                  <span>Video ID: {video.youtubeVideoId}</span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    handleEditVideo(video);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    handleDeleteVideo(video.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {videos.length === 0 && (
                        <div className="text-center py-12">
                          <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600">No videos added yet. Add your first unlisted YouTube video to get started.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Edit Batch Dialog */}
              <Dialog open={isEditBatchDialogOpen} onOpenChange={setIsEditBatchDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Batch</DialogTitle>
                    <DialogDescription>
                      Update the batch information.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="edit-name"
                        value={batchForm.name}
                        onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., Advanced Mathematics"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="edit-description"
                        value={batchForm.description}
                        onChange={(e) => setBatchForm({ ...batchForm, description: e.target.value })}
                        className="col-span-3"
                        placeholder="Brief description of the batch..."
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-thumbnailUrl" className="text-right">
                        Thumbnail URL
                      </Label>
                      <Input
                        id="edit-thumbnailUrl"
                        value={batchForm.thumbnailUrl}
                        onChange={(e) => setBatchForm({ ...batchForm, thumbnailUrl: e.target.value })}
                        className="col-span-3"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-isActive" className="text-right">
                        Active
                      </Label>
                      <Switch
                        id="edit-isActive"
                        checked={batchForm.isActive || false}
                        onCheckedChange={(checked) => setBatchForm({ ...batchForm, isActive: checked })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      onClick={handleUpdateBatch}
                      disabled={updateBatchMutation.isPending}
                    >
                      {updateBatchMutation.isPending ? "Updating..." : "Update Batch"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Subject Dialog */}
              <Dialog open={isEditSubjectDialogOpen} onOpenChange={setIsEditSubjectDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Subject</DialogTitle>
                    <DialogDescription>
                      Update the subject information.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-subject-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="edit-subject-name"
                        value={subjectForm.name}
                        onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., Calculus Basics"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-subject-description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="edit-subject-description"
                        value={subjectForm.description}
                        onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                        className="col-span-3"
                        placeholder="Brief description of the subject..."
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-subject-order" className="text-right">
                        Order
                      </Label>
                      <Input
                        id="edit-subject-order"
                        type="number"
                        value={subjectForm.orderIndex}
                        onChange={(e) => setSubjectForm({ ...subjectForm, orderIndex: parseInt(e.target.value) || 0 })}
                        className="col-span-3"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      onClick={handleUpdateSubject}
                      disabled={updateSubjectMutation.isPending}
                    >
                      {updateSubjectMutation.isPending ? "Updating..." : "Update Subject"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Video Dialog */}
              <Dialog open={isEditVideoDialogOpen} onOpenChange={setIsEditVideoDialogOpen}>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Edit Video</DialogTitle>
                    <DialogDescription>
                      Update the video information.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-video-title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="edit-video-title"
                        value={videoForm.title}
                        onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., Introduction to Functions"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-video-description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="edit-video-description"
                        value={videoForm.description}
                        onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                        className="col-span-3"
                        placeholder="Brief description of the video content..."
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-video-id" className="text-right">
                        YouTube URL/ID
                      </Label>
                      <div className="col-span-3 space-y-2">
                        <Input
                          id="edit-video-id"
                          value={videoForm.youtubeVideoId}
                          onChange={(e) => setVideoForm({ ...videoForm, youtubeVideoId: e.target.value })}
                          placeholder="Paste any YouTube URL or Video ID"
                        />
                        <p className="text-xs text-gray-500">
                          Accepts: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/..., or just the video ID
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-video-duration" className="text-right">
                        Duration (min)
                      </Label>
                      <Input
                        id="edit-video-duration"
                        type="number"
                        value={videoForm.duration}
                        onChange={(e) => setVideoForm({ ...videoForm, duration: parseInt(e.target.value) || 0 })}
                        className="col-span-3"
                        placeholder="0"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-video-order" className="text-right">
                        Order
                      </Label>
                      <Input
                        id="edit-video-order"
                        type="number"
                        value={videoForm.orderIndex}
                        onChange={(e) => setVideoForm({ ...videoForm, orderIndex: parseInt(e.target.value) || 0 })}
                        className="col-span-3"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      onClick={handleUpdateVideo}
                      disabled={updateVideoMutation.isPending}
                    >
                      {updateVideoMutation.isPending ? "Updating..." : "Update Video"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Course Dialog */}
              <Dialog open={isEditCourseDialogOpen} onOpenChange={setIsEditCourseDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Course</DialogTitle>
                    <DialogDescription>
                      Update the course information.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateCourse}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-course-name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="edit-course-name"
                          value={courseForm.name}
                          onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                          className="col-span-3"
                          placeholder="e.g., Advanced Mathematics"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-course-description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="edit-course-description"
                          value={courseForm.description}
                          onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                          className="col-span-3"
                          placeholder="Brief description of the course..."
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-course-thumbnail" className="text-right">
                          Thumbnail URL
                        </Label>
                        <Input
                          id="edit-course-thumbnail"
                          value={courseForm.thumbnailUrl}
                          onChange={(e) => setCourseForm({ ...courseForm, thumbnailUrl: e.target.value })}
                          className="col-span-3"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-course-order" className="text-right">
                          Order
                        </Label>
                        <Input
                          id="edit-course-order"
                          type="number"
                          value={courseForm.orderIndex}
                          onChange={(e) => setCourseForm({ ...courseForm, orderIndex: parseInt(e.target.value) || 0 })}
                          className="col-span-3"
                          placeholder="0"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-course-active" className="text-right">
                          Active
                        </Label>
                        <Switch
                          id="edit-course-active"
                          checked={courseForm.isActive}
                          onCheckedChange={(checked) => setCourseForm({ ...courseForm, isActive: checked })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={updateCourseMutation.isPending}
                      >
                        {updateCourseMutation.isPending ? "Updating..." : "Update Course"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="ads" className="p-6 mt-0">
              <AdminAds />
            </TabsContent>

            <TabsContent value="brand-promotions" className="p-6 mt-0">
              <BrandPromotions />
            </TabsContent>

            <TabsContent value="banner-ads" className="p-6 mt-0">
              <BannerAdsControl />
            </TabsContent>

            <TabsContent value="multi-platform" className="p-6 mt-0">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Multi-Platform Video Management</h3>
                    <p className="text-sm text-gray-600">Manage videos from Vimeo, Facebook, Dailymotion, Twitch, and other platforms</p>
                  </div>
                  <Button onClick={() => setIsCreatePlatformVideoDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Platform Video
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Platform Video Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                            <span className="text-red-600 font-bold">Y</span>
                          </div>
                          <span className="font-medium">YouTube</span>
                        </div>
                        <Badge variant="secondary">Main Platform</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-blue-600 font-bold">V</span>
                          </div>
                          <span className="font-medium">Vimeo</span>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-200">✓ Supported</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-blue-600 font-bold">F</span>
                          </div>
                          <span className="font-medium">Facebook</span>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-200">✓ Supported</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                            <span className="text-orange-600 font-bold">D</span>
                          </div>
                          <span className="font-medium">Dailymotion</span>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-200">✓ Supported</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                            <span className="text-purple-600 font-bold">T</span>
                          </div>
                          <span className="font-medium">Twitch</span>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-200">✓ Supported</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-gray-600 font-bold">T</span>
                          </div>
                          <span className="font-medium">Telegram</span>
                        </div>
                        <Badge variant="outline" className="text-yellow-600 border-yellow-200">⚠ Limited</Badge>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">About Telegram Video Support</h4>
                      <p className="text-sm text-blue-700">
                        Telegram videos from private channels (like t.me/c/2281650605/2514) cannot be directly embedded due to privacy restrictions. 
                        Users need to be members of the channel to view such content. Public Telegram videos may work with external video 
                        extraction tools, but this requires additional setup and may violate terms of service.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Platform Videos List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Existing Platform Videos ({platformVideos.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {platformVideosLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : platformVideos.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Video className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No platform videos added yet</p>
                        <p className="text-sm">Click "Add Platform Video" to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {platformVideos.map((video) => (
                          <div key={video.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-gray-600 font-bold">
                                  {video.platform === 'vimeo' ? 'V' : 
                                   video.platform === 'facebook' ? 'F' : 
                                   video.platform === 'dailymotion' ? 'D' : 
                                   video.platform === 'twitch' ? 'T' : 
                                   video.platform === 'telegram' ? 'T' : '?'}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium">{video.title}</h4>
                                <p className="text-sm text-gray-600 capitalize">
                                  {video.platform} • {video.isActive ? 'Active' : 'Inactive'}
                                </p>
                                <p className="text-xs text-gray-500 truncate max-w-md">
                                  {video.videoUrl}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={video.isActive ? "default" : "secondary"}>
                                {video.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Button variant="outline" size="sm">
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Platform Video Creation Dialog */}
        <Dialog open={isCreatePlatformVideoDialogOpen} onOpenChange={setIsCreatePlatformVideoDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Platform Video</DialogTitle>
              <DialogDescription>
                Add a video from Vimeo, Facebook, Dailymotion, Twitch, or other supported platforms.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="platform-video-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="platform-video-title"
                  value={platformVideoForm.title}
                  onChange={(e) => setPlatformVideoForm({ ...platformVideoForm, title: e.target.value })}
                  className="col-span-3"
                  placeholder="Video title"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="platform-video-platform" className="text-right">
                  Platform
                </Label>
                <Select
                  value={platformVideoForm.platform}
                  onValueChange={(value) => setPlatformVideoForm({ ...platformVideoForm, platform: value as any })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="dailymotion">Dailymotion</SelectItem>
                    <SelectItem value="twitch">Twitch</SelectItem>
                    <SelectItem value="peertube">PeerTube</SelectItem>
                    <SelectItem value="rumble">Rumble</SelectItem>
                    <SelectItem value="telegram">Telegram (Limited)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="platform-video-url" className="text-right">
                  Video URL
                </Label>
                <Input
                  id="platform-video-url"
                  value={platformVideoForm.videoUrl}
                  onChange={(e) => setPlatformVideoForm({ ...platformVideoForm, videoUrl: e.target.value })}
                  className="col-span-3"
                  placeholder="https://vimeo.com/123456789"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="platform-video-id" className="text-right">
                  Video ID
                </Label>
                <Input
                  id="platform-video-id"
                  value={platformVideoForm.videoId}
                  onChange={(e) => setPlatformVideoForm({ ...platformVideoForm, videoId: e.target.value })}
                  className="col-span-3"
                  placeholder="Optional: specific video ID"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="platform-video-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="platform-video-description"
                  value={platformVideoForm.description}
                  onChange={(e) => setPlatformVideoForm({ ...platformVideoForm, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Video description (optional)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="platform-video-duration" className="text-right">
                  Duration (seconds)
                </Label>
                <Input
                  id="platform-video-duration"
                  type="number"
                  value={platformVideoForm.duration}
                  onChange={(e) => setPlatformVideoForm({ ...platformVideoForm, duration: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="platform-video-order" className="text-right">
                  Order
                </Label>
                <Input
                  id="platform-video-order"
                  type="number"
                  value={platformVideoForm.orderIndex}
                  onChange={(e) => setPlatformVideoForm({ ...platformVideoForm, orderIndex: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                  placeholder="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleCreatePlatformVideo}
                disabled={createPlatformVideoMutation.isPending}
              >
                {createPlatformVideoMutation.isPending ? "Creating..." : "Create Platform Video"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}