import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import type { Batch } from "@shared/schema";

interface BatchCardProps {
  batch: Batch;
}

export default function BatchCard({ batch }: BatchCardProps) {
  // Use a professional educational image from Unsplash
  const imageUrl = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200";

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer border hover:border-primary">
      <img 
        src={imageUrl} 
        alt={batch.name}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{batch.name}</h3>
        {batch.description && (
          <p className="text-gray-600 text-sm mb-4">{batch.description}</p>
        )}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Created {new Date(batch.createdAt!).toLocaleDateString()}
          </span>
          <div className="flex items-center text-secondary text-sm">
            <span>View</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
