"use client";
import LoadingBtn from "@/components/loading-btn";
import { Button } from "@/components/ui/button";
import { reset, seed } from "@/lib/db/seed";
import { Bean, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Seeder() {
  const [isSeedLoading, setIsSeedLoading] = useState<boolean>(false);
  const [isResetLoading, setIsResetLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const clearStorageAndCookies = () => {
    // Clear localStorage & sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    // Remove all cookies
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.split("=");
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
    toast.success("Cleared all cookies and storage.");
  };

  const seeder = async () => {
    if (isResetLoading) {
      toast.error("Reset in progress");
      return;
    }
    setIsSeedLoading(true);
    const { message, error } = await seed();
    if (message) {
      toast(message);
      setIsSeedLoading(false);
    }
    if (error) {
      toast.error(error as string);
      setIsSeedLoading(false);
    }
  };

  const reseter = async () => {
    if (isSeedLoading) {
      toast.error("Seed in progress");
      return;
    }
    setIsResetLoading(true);
    // Clear storage and cookies before resetting the database
    clearStorageAndCookies();
    const { message, error } = await reset();
    if (message) {
      toast(message);
      setIsResetLoading(false);
    }
    if (error) {
      toast.error(error as string);
      setIsResetLoading(false);
    }
  };

  return (
    <div className="fixed right-0 top-1/4 transform -translate-y-1/2 flex z-50">
      <Button
        variant="outline"
        size="sm"
        className="rounded-l-md rounded-r-none border-r-0 h-10 bg-zinc-800 hover:bg-zinc-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronRight fill="white" /> : <ChevronLeft fill="white" />}
      </Button>
      
      <div 
        className={`transition-all duration-300 overflow-hidden border-y-2 border-l-2 border-zinc-800 ${
          isExpanded ? "w-64" : "w-0"
        }`}
      >
        <div className="p-4 w-64">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span>Seed:</span>
              <LoadingBtn
                isLoading={isSeedLoading}
                onClick={async () => await seeder()}
              >
                <Bean />
                Seed
              </LoadingBtn>
            </div>
            <div className="flex flex-col gap-1">
              <span>Reset:</span>
              <LoadingBtn
                isLoading={isResetLoading}
                variant={"destructive"}
                onClick={async () => await reseter()}
              >
                <Trash2 />
                Reset
              </LoadingBtn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}