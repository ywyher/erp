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
import { useEffect, useState } from "react";
import Link from "next/link";
import { Value } from "@udecode/plate";
import { Post } from "@/lib/db/schema";
import DeletePost from "@/app/(authenticated)/dashboard/(admin)/posts/_components/delete";

export default function PostActions({
  postId,
  slug,
  content,
  thumbnail
}: {
  postId: Post['id']
  slug: Post['slug']
  content: Value
  thumbnail: Post['thumbnail']
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    const uniqueNames = Array.from(
      new Set(content.filter((con) => (
        con.type == 'img'
      || con.type == 'video' 
      || con.type == 'file' 
      || con.type == 'audio'
      )).map((con) => con.name))
    ) as string[];
  
    setNames([...uniqueNames, thumbnail]);
  }, [content, thumbnail]); // Include `thumbnail` in dependencies
  
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
          <Link href={`/dashboard/posts/preview/${slug}`}>
            <Button className="w-full">
              Preveiw
            </Button>
          </Link>
          <Link href={`/dashboard/posts/update/${slug}`}>
            <Button className="w-full">
              Update
            </Button>
          </Link>
          <DeletePost
            id={postId}
            names={names}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
