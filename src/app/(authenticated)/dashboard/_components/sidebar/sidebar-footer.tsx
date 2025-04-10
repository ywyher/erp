"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSession, signOut } from "@/lib/auth-client";

import {
  SidebarFooter as CSidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevronUp, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import Pfp from "@/components/pfp";
import { useState } from "react";
import { toast } from "sonner";

export default function SidebarFooter() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useSidebar();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["session", "dashboardSidebarFooter"],
    queryFn: async () => {
      const { data } = await getSession();
      return data?.user || null;
    },
  });
  
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


  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      {user && (
        <CSidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu onOpenChange={setIsOpen}>
                {state == "expanded" ? (
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton>
                      <Pfp image={user.image || ""} />
                      <span className="capitalize">{user.name}</span>
                      <ChevronUp
                        className={`ml-auto transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                ) : (
                  <DropdownMenuTrigger
                    className="
                      items-center rounded-lg transition
                      hover:bg-white hover:bg-opacity-10
                    "
                  >
                    <Pfp image={user.image || ""} />
                  </DropdownMenuTrigger>
                )}
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem className="text-center">
                    {user.name} ({user.username})
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push("/settings")}
                  >
                    <Settings />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => handleLogout()}
                  >
                    <LogOut />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </CSidebarFooter>
      )}
    </>
  );
}
