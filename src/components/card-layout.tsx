import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import clsx from "clsx";
import { ReactNode } from "react";

interface CardLayoutProps {
  children: ReactNode;
  title?: string;
  variant?: 'default' | 'home'
  className?: string;
  contentClassName?: string;
}

export default function CardLayout({
  children,
  title,
  variant = 'default',
  className,
  contentClassName,
}: CardLayoutProps) {
  return (
<div className="px-6 w-full">
  <Card className={clsx(
    "w-full max-w-6xl mx-auto border-none rounded-lg",
    "py-3 px-6",
    variant == 'home' && 'bg-transparent shadow-none',
    className,
  )}>
      {title && (
        <CardHeader className={clsx(
          "pb-2 mx-0 px-0",
          variant === 'home' && "mb-6 relative"
        )}>
          <CardTitle className={clsx(
            "text-2xl font-semibold",
            variant === 'home' && "text-5xl font-bold tracking-tight"
          )}>
            {title}
            {variant === 'home' && <span className="ml-1 text-primary">.</span>}
          </CardTitle>
          {variant === 'home' && (
            <div className="absolute -bottom-2 left-0 h-px w-full bg-gradient-to-r from-primary/50 via-primary to-transparent"></div>
          )}
        </CardHeader>
      )}
      <CardContent
        className={clsx(
          "pt-2 p-0",
          contentClassName
        )}>
        {children}
      </CardContent>
    </Card>
</div>

  );
}