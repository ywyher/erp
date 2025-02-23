import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type CardLayoutProps = {
  children: React.ReactNode;
  title?: string;
};

export default function CardLayout({ children, title }: CardLayoutProps) {
  return (
    <Card className="p-4 shadow-md rounded-lg w-full m-2">
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}