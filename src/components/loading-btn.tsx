import React from "react";
import { Button } from "@/components/ui/button";

export default function LoadingBtn({
    isLoading,
    variant = 'default',
    onClick,
    children,
    className
}: {
    isLoading: boolean;
    variant?: 'default' | 'destructive';
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Button
            type="submit"
            className="w-full bg-[#E4E4E7] text-black hover:bg-white"
            disabled={isLoading}
            variant={variant}
            onClick={onClick}
        >
            {isLoading ? (
                <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                </svg>
            ) : (
                children
            )}
        </Button>
    )
}