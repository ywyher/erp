"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Preset } from "@/lib/db/schema";
import Delete from "@/app/(authenticated)/dashboard/_components/delete";


export default function PresetActions({
  preset,
}: {
  preset: Preset
}) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-2">
          <Link href={`/dashboard/presets/update/${preset.id}`}>
            <Button className="w-full">
              Update
            </Button>
          </Link>
          <Delete
            id={preset.id}
            table="preset"
            setPopOpen={setOpen}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}