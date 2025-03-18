import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface CardLayoutProps {
    children: ReactNode;
    title?: string;
    className?: string;
}

export default function CardLayout({ children, title, className }: CardLayoutProps) {
    return (
        <Card className={`
        w-full max-w-6xl mx-auto shadow-none border-none rounded-lg
        ${className}
        px-6 py-3 md:px-6 md:py-3
        `}>

            {title && (
                <CardHeader className="pb-2 mx-0 px-0"> {/* Reduced padding-bottom */}
                    <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
                </CardHeader>
            )}
            <CardContent className="pt-2 p-0">{children}</CardContent> {/* Reduced padding-top */}
        </Card>
    );
}