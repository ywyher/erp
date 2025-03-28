"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getSession } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { User } from "@/lib/db/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "@/components/header/menu";
import Links from "@/components/header/links";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import clsx from "clsx";
import { Avatar } from "@/components/plate-ui/avatar";

// Skeleton loading component for right actions
const RightActionsSkeleton = ({ isMobile }: { isMobile: boolean }) => (
  <div className="flex items-center gap-4">
    <ThemeToggle />
    <Avatar className={'bg-foreground rounded-full animate-pulse'} />
  </div>
);

export default function Header({ className = "" }: { className?: string }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ["session", "header"],
    queryFn: async () => {
      const { data } = await getSession()
      return (data?.user as User) || null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const isMobile = useIsMobile();

  // Memoize the right-side content to prevent unnecessary re-renders
  const RightActions = useMemo(() => {
    if (isLoading) return <RightActionsSkeleton isMobile={isMobile} />;
    
    return (
      <div className="flex items-center gap-4">
        <ThemeToggle />
        {user ? (
          <Menu user={user} isMobile={isMobile} />
        ) : (
          <Link href="/auth">
            <Button variant="outline" className="rounded-full">
              Auth
            </Button>
          </Link>
        )}
      </div>
    );
  }, [user, isMobile, isLoading]);

  return (
    <nav
      className={clsx(
        "flex items-center justify-center",
        "px-6 pt-4",
      )}
    >
      <div 
        className={clsx(
          // "absolute top-4 z-10 bg-background",
          "flex items-center justify-between",
          "w-full max-w-6xl",
          "border rounded-2xl shadow-sm",
          "px-5 py-2 md:py-0",
          "bg-background",
          className
        )}
      >
        <Logo />

        <div className="flex-1 flex justify-center">
          <Links user={user || null} isMobile={isMobile} />
        </div>

        {RightActions}
      </div>
    </nav>
  );
}