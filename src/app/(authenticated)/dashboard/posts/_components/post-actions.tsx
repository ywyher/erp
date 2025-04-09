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
import { Post } from "@/lib/db/schema";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import PostComponent from "@/components/post";
import { useQuery } from "@tanstack/react-query";
import { getPostAuthor } from "@/app/(authenticated)/dashboard/posts/actions";
import { useIsMobile } from "@/hooks/use-mobile";
import Delete from "@/app/(authenticated)/dashboard/_components/delete";


export default function PostActions({
  post,
}: {
  post: Post
}) {
  const [open, setOpen] = useState<boolean>(false);

  const isMobile = useIsMobile();

  const { data: author, isLoading: isAuthorLoaidng } = useQuery({
    queryKey: ['post-data', post.id],
    queryFn: async () => {
      return await getPostAuthor({ authorId: post.authorId })
    }
  })
  
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
        {(!isAuthorLoaidng && author) && (
            <>
              {isMobile ? (
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline" size="sm">
                      Preview
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="h-[95vh]">
                    <DrawerHeader>
                      <DrawerTitle className="text-left">Post Preview</DrawerTitle>
                    </DrawerHeader>
                    <div className="px-4 h-full overflow-auto">
                      <PostComponent
                        post={post}
                        author={author}
                      />
                    </div>
                  </DrawerContent>
                </Drawer>
              ): (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      Preview
                    </Button>
                  </SheetTrigger>
                  <SheetContent side='bottom' className="h-[95vh] flex flex-col gap-3">
                    <SheetHeader>
                      <SheetTitle>Post Preview</SheetTitle>
                    </SheetHeader>
                    <div className="h-full overflow-auto">
                      <PostComponent
                        post={post}
                        author={author}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </>
          )}
          {/* <Link href={`/dashboard/posts/preview/${slug}`}>
            <Button className="w-full">
              Preveiw
            </Button>
          </Link> */}
          <Link href={`/dashboard/posts/update/${post.slug}`}>
            <Button className="w-full">
              Update
            </Button>
          </Link>
          <Delete
            id={post.id}
            table="post"
            setPopOpen={setOpen}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}