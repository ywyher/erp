"use client";

import Delete from "@/app/(authenticated)/dashboard/_components/delete";
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
import UpdateFaq from "@/app/(authenticated)/dashboard/(admin)/faqs/_components/update-faq";

export default function FaqActions({
  faqId,
}: {
  faqId: string;
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
          <UpdateFaq faqId={faqId} />
          <Delete
            id={faqId}
            table="faq"
            label="delete"
            setPopOpen={setOpen}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
