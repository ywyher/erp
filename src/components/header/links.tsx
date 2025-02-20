import { StyledLink } from "@/components/header/styled-link";
import { User } from "@/lib/db/schema";
import { CalendarCheck, Home, LayoutDashboard } from "lucide-react";

export default function Links({ user, isMobile, isLabel = true }: {  user: User | null, isMobile: boolean, isLabel?: boolean }) {
  const links = [
    { href: "/", icon: Home, label: "Home" },
    ...(user ? [{ href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }] : []),
    { href: "/booking", icon: CalendarCheck, label: "Booking" },
  ];
  
  return (
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
        )
      })}
    </>
  )
}