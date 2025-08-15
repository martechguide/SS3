import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, 
  Atom, 
  FlaskConical, 
  Dna, 
  BookOpen, 
  Globe, 
  PenTool, 
  Music 
} from "lucide-react";
import type { Subject } from "@shared/schema";

interface SubjectCardProps {
  subject: Subject & { videoCount?: number };
}

const iconMap = {
  "fas fa-calculator": Calculator,
  "fas fa-atom": Atom,
  "fas fa-flask": FlaskConical,
  "fas fa-dna": Dna,
  "fas fa-book": BookOpen,
  "fas fa-globe": Globe,
  "fas fa-pen": PenTool,
  "fas fa-music": Music,
};

const colorMap = {
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  purple: "from-purple-500 to-purple-600",
  red: "from-red-500 to-red-600",
  yellow: "from-yellow-500 to-yellow-600",
  indigo: "from-indigo-500 to-indigo-600",
  pink: "from-pink-500 to-pink-600",
  teal: "from-teal-500 to-teal-600",
};

export default function SubjectCard({ subject }: SubjectCardProps) {
  const IconComponent = iconMap[subject.icon as keyof typeof iconMap] || BookOpen;
  const gradientColor = colorMap[subject.color as keyof typeof colorMap] || colorMap.blue;
  
  // Mock progress for now - in real app, this would come from user progress data
  const progress = Math.floor(Math.random() * 100);
  // Use actual video count from API data
  const videoCount = subject.videoCount || 0;
  const duration = Math.floor(Math.random() * 15) + 5;

  return (
    <Link href={subject.courseId 
      ? `/batch/${subject.batchId}/course/${subject.courseId}/subject/${subject.id}`
      : `/batch/${subject.batchId}/subject/${subject.id}`}>
      <Card className="shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer border hover:border-primary hover:-translate-y-1">
        <CardContent className="p-6">
          <div className={`h-12 w-12 bg-gradient-to-br ${gradientColor} rounded-xl flex items-center justify-center mb-4`}>
            <IconComponent className="text-white text-xl" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{subject.name}</h3>
          {subject.description && (
            <p className="text-gray-600 text-sm mb-4">{subject.description}</p>
          )}
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
          
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{videoCount} Videos</span>
            <span>{duration} hours</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
