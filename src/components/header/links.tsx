import { StyledLink } from "@/components/header/styled-link";
import { User } from "@/lib/db/schema";
import { BookCopy, CalendarCheck, FileHeart, Home, LayoutDashboard } from "lucide-react";

export default function Links({
  user,
  isMobile,
  isLabel = true,
}: {
  user: User | null;
  isMobile: boolean;
  isLabel?: boolean;
}) {
  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/booking", icon: CalendarCheck, label: "Booking" },
    { href: "/posts", icon: BookCopy, label: "Posts" },
    ...(user ? [{ href: "/appointments", icon: FileHeart, label: "My Appointments" }] : []),
    ...(user && user.role != 'user'
      ? [{ href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }]
      : []),
  ];

  return (
    <div className="flex flex-row gap-5">
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
    </div>
  );
}