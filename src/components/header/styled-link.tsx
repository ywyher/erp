"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function StyledLink({
  children,
  href,
  icon: Icon,
  isLabel = true,
  isMobile,
}: {
  children: React.ReactNode;
  href: string;
  icon: React.ElementType;
  isLabel?: boolean;
  isMobile: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const activeStyles = {
    desktop: {
      text: "text-zinc-950 dark:text-zinc-100",
      border: "border-b-zinc-950 dark:border-b-zinc-100",
      hover: "hover:border-b-zinc-700 hover:text-zinc-800 dark:hover:border-b-zinc-200 dark:hover:text-zinc-200"
    },
    mobile: {
      text: "text-zinc-950 dark:text-zinc-100 font-semibold",
      hover: "hover:text-zinc-800 dark:hover:text-zinc-200"
    }
  };

  const desktopClasses = clsx(
    "border-b-2 text-sm py-4 px-3",
    isActive
      ? [activeStyles.desktop.text, activeStyles.desktop.border]
      : "border-b-transparent text-zinc-600 dark:text-zinc-400",
    
    !isActive && activeStyles.desktop.hover
  );

  const mobileClasses = clsx(
    "text-lg",
    isActive ? activeStyles.mobile.text : "text-zinc-600 dark:text-zinc-400",
    !isActive && activeStyles.mobile.hover
  );
  
  const linkClasses = clsx(
    "flex items-center gap-2 font-medium transition",
    isMobile ? mobileClasses : desktopClasses
  );
  
  return (
    <Link href={href} className={linkClasses}>
      {isMobile && <Icon className="w-6 h-6" />}
      {isLabel && !isMobile && children}
    </Link>
  );
}