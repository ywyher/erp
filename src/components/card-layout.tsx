import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import clsx from "clsx";
import { ReactNode } from "react";

interface CardLayoutProps {
    children: ReactNode;
    title?: string;
    className?: string;
    contentClassName?: string;
}

export default function CardLayout({ children, title, className, contentClassName }: CardLayoutProps) {
    return (
        <Card className={clsx(
            "w-full max-w-6xl mx-auto shadow-none border-none bg-transparent rounded-lg",
            "py-3 px-6",
            className
        )}>

            {title && (
                <CardHeader className="pb-2 mx-0 px-0"> {/* Reduced padding-bottom */}
                    <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
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
    );
}