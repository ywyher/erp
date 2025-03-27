import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DataTableSkeleton() {
  return (
    <Card className="p-4 rounded-2xl shadow-md">
      <CardContent className="p-0">
        {/* Table Header */}
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-10 w-64 rounded-lg" /> {/* Filter Input */}
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20 rounded-lg" /> {/* Status Filter */}
            <Skeleton className="h-10 w-20 rounded-lg" /> {/* View Button */}
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-4 bg-muted p-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Skeleton Rows */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-4 items-center border-t p-3 gap-4"
            >
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}