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
        <Icon size={30} color='#4200FF' />
        <div className='flex flex-col'>
            <CardHeader className='p-0 font-bold text-lg'>{title}</CardHeader>
            <CardContent className='p-0 text-gray-500 text-sm'>
                {description}
            </CardContent>
        </div>
      </Card>
    );
}