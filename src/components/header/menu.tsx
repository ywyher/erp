"use client";

import { useRouter } from "next/navigation";
import {
  LogOut,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Pfp from "@/components/pfp";
import { Separator } from "@/components/ui/separator";
import { User } from "@/lib/db/schema";
import { getLinks } from "@/components/header/links";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";

export function Menu({ user, isMobile }: { user: User; isMobile: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    const { error } = await signOut()
    
    if(error) {
      toast.error(error.message)
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['session'] })
    router.push('/')
  }
  if (!user) return;

  const links = getLinks(user)

  if (isMobile)
    return (
      <Sheet>
        <SheetTrigger>
          <Pfp image={user.image || ""} />
        </SheetTrigger>
        <SheetContent className="flex flex-col gap-5 w-[300px]">
          <div className="flex flex-col gap-4">
            <SheetHeader>
              <SheetTitle>
                Hello, <span className="capitalize">{user.name}</span> (
                {user.username})
              </SheetTitle>
            </SheetHeader>
            <Separator />
          </div>
          <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-col gap-1 w-full">
              {links.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <link.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>
            <Separator />
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <span className="font-medium">Settings</span>
            </Link>
            <div className="flex items-end h-full">
              <Button className="w-full" onClick={() => handleLogout()}>
                <LogOut />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2 cursor-pointer">
        <Pfp image={user.image || ""} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        <DropdownMenuLabel className="capitalize">
          Hello, {user.name} ({user.username})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push("settings")}
          >
            <Settings />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => handleLogout()}
        >
          <LogOut />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
