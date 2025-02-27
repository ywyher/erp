"use client";

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
  const isActive = href === pathname;

  const mobileClass = `
      text-lg
      hover:text-zinc-900 dark:hover:text-zinc-200
      ${isActive ? "text-zinc-950 dark:text-zinc-200" : "text-zinc-900 dark:text-zinc-400"}
  `;

  return (
    <Link
      href={href}
      className={`
              flex items-center gap-2 font-medium transition
              ${
                !isMobile
                  ? `
                  border-b-2 text-sm py-4 px-3
                  ${
                    isActive
                      ? "border-b-zinc-950 text-zinc-950 dark:border-b-zinc-200 dark:text-zinc-200"
                      : "border-b-transparent text-zinc-900 dark:text-zinc-400"
                  }
                  hover:border-b-zinc-800 hover:text-zinc-950 dark:hover:border-b-zinc-900 dark:hover:text-zinc-200
              `
                  : mobileClass
              }
          `}
    >
      <Icon className={`${isMobile ? "w-6 h-6" : "w-4 h-4"}`} />
      {isLabel && children}
    </Link>
  );
}
