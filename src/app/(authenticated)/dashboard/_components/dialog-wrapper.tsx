"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dispatch, SetStateAction } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function DialogWrapper({
  children,
  open,
  setOpen,
  label,
  operation,
}: {
  children: React.ReactNode;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  label: string;
  operation: "create" | "update";
}) {
  const isMobile = useIsMobile();

  if (isMobile)
    return (
      <div
        className={`${operation == "create" && `flex items-end justify-start w-full h-screen`}`}
      >
        <div
          className={`${operation == "create" && `sticky bottom-0 w-full p-4 shadow-md`}`}
        >
          <Button onClick={() => setOpen(true)} className="w-full capitalize">
            {operation == "create" ? (
              <>
                Create {label == "admin" ? "An" : "A"} {label}
              </>
            ) : (
              <>Update</>
            )}
          </Button>

          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent className="p-4 h-[calc(100vh-10vh)]">
              <DrawerHeader className="text-left px-0">
                <DrawerTitle>Edit profile</DrawerTitle>
                <DrawerDescription>
                  Make changes to your profile here. Click save when you're
                  done.
                </DrawerDescription>
              </DrawerHeader>
              {children}
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    );

  return (
    <div
      className={`${operation == "create" && `flex items-end justify-start w-full h-screen`}`}
    >
      <div
        className={`${operation == "create" && `sticky bottom-0 w-full p-4 shadow-md`}`}
      >
        <Button onClick={() => setOpen(true)} className="w-full capitalize">
          {operation == "create" ? (
            <>
              Create {label == "admin" ? "An" : "A"} {label}
            </>
          ) : (
            <>Update</>
          )}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">Create New {label}</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a new user. All fields are
              required.
            </DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    </div>
  );
}
