"use client";

import { useCreateEditor } from "@/components/editor/use-create-editor"
import Pfp from "@/components/pfp"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Post as TPost } from "@/lib/db/schema"
import { Value } from "@udecode/plate"
import { Plate, PlateContent } from "@udecode/plate/react"
import { format } from "date-fns"
import Link from "next/link"
import Image from "next/image"
import { getFileUrl } from "@/lib/funcs"
import CardLayout from "@/components/card-layout";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type PostProps = {
  post: TPost
  author: User
}

export default function Post({ post, author }: PostProps) {
  const editor = useCreateEditor({ value: post.content as Value, readOnly: true });
  const router = useRouter()

  return (
    <>
      <CardLayout className="pt-4 w-full flex items-center justify-center">
        <div className="flex flex-col items-start">
          <Button 
            variant="link"
            className="flex items-center gap-2 p-0 text-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            onClick={() => router.push('/posts')}
          >
            <ArrowLeft size={18} /> Go Back
          </Button>
          <div className="w-full max-w-2xl px-4 md:px-0">
            <div className="flex flex-col gap-6">
              {/* Post Header */}
              <div className="flex flex-col gap-6">
                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">{post.title}</h1>
                
                {/* Author info and date */}
                <div className="flex flex-row gap-3 items-center">
                  <Pfp image={author.image} />
                  <div className="flex flex-col">
                    <p className="font-medium capitalize">{author.name}</p>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <span>{format(post.createdAt, "MMM d, yyyy")}</span>
                      <span>•</span>
                      <span>{"5 min read"}</span>
                    </div>
                  </div>
                </div>
                
              </div>
              
              <Separator className="my-2" />
              
              {/* Post Content */}
              <div className="flex flex-col gap-1z2">
                {post.thumbnail && (
                  <div className="w-full aspect-[16/9] relative overflow-hidden rounded-lg">
                    <Image
                      src={getFileUrl(post.thumbnail)} 
                      alt={post.title}
                      fill
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="max-w-none">
                    <Plate
                        editor={editor}
                        readOnly
                    >
                      <PlateContent className="min-h-[50vh]" />
                    </Plate>
                </div>
              </div>
              
              {/* Post Footer */}
              <Separator className="my-2" />
              
              <div className="flex flex-row flex-wrap gap-2 pt-2">
                {post.tags?.split(',').map((tag, index) => (
                  <Link key={index} href={`/posts?category=${post.category}`}>
                    <Badge 
                      className="text-sm py-1 px-3 transition-colors 
                      hover:bg-gray-100 hover:text-black 
                      dark:hover:bg-gray-700 dark:hover:text-white"
                      variant={'outline'}
                    >
                      {tag.trim()}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardLayout>
    </>
  )
}