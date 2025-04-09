import DynamicIcon from "@/components/dynamic-icon";
import { IconName } from "@/components/icons-selector";
import { Card, CardContent } from "@/components/ui/card";
import { Service } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  icon: IconName;
  title: Service['title'];
  className?: string;
}

export default function ServiceCard({
  icon,
  title,
  className
}: ServiceCardProps) {
  return (
    <div className={cn("w-full max-w-[450px] aspect-square", className)}>
      <Card className="
        h-full w-full overflow-hidden group
        transition-all duration-200 hover:shadow-lg hover:border-0
      ">
        <CardContent className="
          flex flex-col items-center justify-center p-6 h-full 
          gap-5 relative z-10 transition-all duration-200
        ">
          {/* Gradient Overlay */}
          <div className="
            absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/20
            opacity-0 transition-opacity duration-200 group-hover:opacity-100
          " />
          <DynamicIcon 
            name={icon} 
            size={48} 
            color="hsl(var(--primary))" 
          />
          <p className="text-2xl font-semibold text-center line-clamp-2 transition-all duration-200 group-hover:text-primary">
            {title}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
