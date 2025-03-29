import { Card, CardContent, CardHeader } from "@/components/ui/card";
import clsx from "clsx";
import { LucideIcon } from "lucide-react";

export default function FloatingCard({
    title,
    description,
    Icon,
    className = "",
   }: {
    title: string;
    description: string,
    Icon: LucideIcon;
    className?: string;
   }) {
    return (
      <Card
        className={clsx(
          "absolute flex flex-row gap-3 items-center p-3",
          className
        )}
      >
        <Icon size={30} color="hsl(var(--primary))" />
        <div className='flex flex-col'>
            <CardHeader className='p-0 text-lg font-bold'>{title}</CardHeader>
            <CardContent className='p-0 text-sm text-gray-500'>
                {description}
            </CardContent>
        </div>
      </Card>
    );
}