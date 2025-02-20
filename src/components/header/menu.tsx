'use client'

import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import Pfp from "@/components/pfp";
import { Separator } from "@/components/ui/separator";
import { StyledLink } from "@/components/header/styled-link";
import { User } from "@/lib/db/schema";
import Links from "@/components/header/links";

export function Menu({ user, isMobile }: { user: User, isMobile: boolean }) {
  const router = useRouter();

  if (!user) return;

  if(isMobile) return (
      <Sheet>
          <SheetTrigger>
              <Pfp image={user.image || ''} />
          </SheetTrigger>
          <SheetContent className="flex flex-col gap-5 w-[300px]">
              <div className="flex flex-col gap-4">
                  <SheetHeader>
                      <SheetTitle>
                          Hello, <span className="capitalize">{user.name}</span> ({user.username})
                      </SheetTitle>
                  </SheetHeader>
                  <Separator />
              </div>
              <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-5">
                    <Links 
                        isMobile={isMobile}
                        user={user}
                    />
                  </div>
                  <Separator />
                  <StyledLink href="/settings" icon={Settings} isMobile={isMobile}>Settings</StyledLink>
                  <StyledLink href="/logout" icon={LogOut} isMobile={isMobile}>Logout</StyledLink>
              </div>
          </SheetContent>
      </Sheet>
  )

  return (
      <DropdownMenu>
          <DropdownMenuTrigger className="p-2 cursor-pointer">
              <Pfp image={user.image || ''} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-44">
              <DropdownMenuLabel className="capitalize">Hello, {user.name} ({user.username})</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('settings')}>
                      <Settings />
                      <span>Settings</span>
                  </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/logout')}>
                  <LogOut />
                  <span>Log out</span>
              </DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>
  )
}