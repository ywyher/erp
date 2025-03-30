import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function ServiceCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("w-full aspect-square", className)}>
      <Card className="h-full w-full">
        <CardContent className="flex flex-col items-center justify-center p-6 h-full gap-5">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-8 w-3/4" />
        </CardContent>
      </Card>
    </div>
  );
}