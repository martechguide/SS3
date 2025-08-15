import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ArrowRight } from "lucide-react";
import type { Course } from "@shared/schema";

interface CourseCardProps {
  course: Course;
  batchId: string;
}

export default function CourseCard({ course, batchId }: CourseCardProps) {
  return (
    <Link href={`/batch/${batchId}/course/${course.id}`}>
      <Card className="shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer border hover:border-primary hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="text-white text-xl" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
          {course.description && (
            <p className="text-gray-600 text-sm mb-4">{course.description}</p>
          )}
          
          <div className="flex justify-between items-center text-sm text-gray-500 mt-4">
            <span>Course</span>
            <div className="flex items-center text-primary">
              <span>View</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}