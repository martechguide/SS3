import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import SubjectCard from "@/components/subject-card";
import CourseCard from "@/components/course-card";
import GridViewToggle, { getGridClassName } from "@/components/grid-view-toggle";

import { useViewMode } from "@/hooks/use-view-mode";
import { GraduationCap, ArrowLeft } from "lucide-react";
import type { Subject, Batch, Course } from "@shared/schema";

export default function BatchSubjects() {
  const { batchId, courseId } = useParams<{ batchId: string; courseId?: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useViewMode('batch-subjects-view-mode', 'grid-medium');

  const { data: batch } = useQuery<Batch>({
    queryKey: [`/api/batches/${batchId}`],
    retry: false,
  });

  // Fetch courses if no courseId (showing batch level)
  const { data: courses } = useQuery<Course[]>({
    queryKey: [`/api/batches/${batchId}/courses`],
    retry: false,
    enabled: !courseId, // Only fetch when not viewing a specific course
  });

  const { data: subjects, isLoading, error } = useQuery<Subject[]>({
    queryKey: courseId 
      ? [`/api/courses/${courseId}/subjects`]
      : [`/api/batches/${batchId}/subjects`],
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <GraduationCap className="text-white text-sm" size={16} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{batch?.name}</h1>
                <p className="text-sm text-gray-500">Choose a subject to start learning</p>
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
        {/* Show courses if no courseId (batch level) */}
        {!courseId && courses && courses.length > 0 && (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Courses</h2>
                  <p className="text-gray-600">Choose a course to view subjects</p>
                </div>
                <GridViewToggle 
                  viewMode={viewMode} 
                  onViewModeChange={setViewMode}
                />
              </div>
            </div>
            <div className={getGridClassName(viewMode)}>
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} batchId={batchId} />
              ))}
            </div>
          </>
        )}

        {/* Show subjects (either batch-level or course-level) */}
        {subjects && subjects.length > 0 && (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {courseId ? "Course Subjects" : "Direct Subjects"}
                  </h2>
                  <p className="text-gray-600">Choose a subject to continue learning</p>
                </div>
                {(!courseId || !courses || courses.length === 0) && (
                  <GridViewToggle 
                    viewMode={viewMode} 
                    onViewModeChange={setViewMode}
                  />
                )}
              </div>
            </div>
            <div className={getGridClassName(viewMode)}>
              {subjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </div>
          </>
        )}

        {/* No content available message */}
        {(!subjects || subjects.length === 0) && (!courses || courses.length === 0) && (
          <Card className="text-center py-12">
            <CardContent>
              <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content available</h3>
              <p className="text-gray-600">This batch doesn't have any courses or subjects yet.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
