import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type CardLayoutProps = {
  children: React.ReactNode;
  title?: string;
  className?: string;
};

export default function CardLayout({ children, title, className = "" }: CardLayoutProps) {
  return (
    <Card className={`
      relative shadow-md rounded-lg w-full m-2 flex flex-col gap-2
      ${className}
    `}>
      {title && (
        <CardHeader className="pb-0">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  );
}