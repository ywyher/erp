import { StyledLink } from "@/components/header/styled-link";
import { User } from "@/lib/db/schema";
import { BookCopy, CalendarCheck, Ellipsis, FileHeart, Home, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link";

export const staticLinks = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/booking", icon: CalendarCheck, label: "Booking" },
  { href: "/posts", icon: BookCopy, label: "Posts" },
];

// Helper function to get all links including dynamic ones
export function getLinks(user: User | null) {
  return [
    ...staticLinks,
    ...(user ? [{ href: "/appointments", icon: FileHeart, label: "My Appointments" }] : []),
    ...(user && user.role != 'user'
      ? [{ href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }]
      : []),
  ];
}

export default function Links({
  user,
  isMobile,
  isLabel = true,
}: {
  user: User | null;
  isMobile: boolean;
  isLabel?: boolean;
}) {

  const links = getLinks(user)

  return (
    <div className="flex flex-row gap-5">
      {isMobile ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Ellipsis className="w-5 h-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 p-1 bg-white dark:bg-slate-900 shadow-lg rounded-lg border border-slate-200 dark:border-slate-800">
            {links.map((link, index) => (
              <DropdownMenuItem
                key={index}
                asChild
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md focus:bg-slate-100 dark:focus:bg-slate-800"
              >
                <Link
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2 w-full text-sm"
                >
                  <link.icon size={16} className="text-slate-600 dark:text-slate-400" />
                  <span>{link.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ): (
        <>
          {links.map((link, index) => {
            return (
              <StyledLink
                key={index}
                href={link.href}
                icon={link.icon}
                isMobile={isMobile}
                isLabel={isLabel}
              >
                {link.label}
              </StyledLink>
            );
          })}
        </>
      )}
    </div>
  );
}