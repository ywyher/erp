"use client"

import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

import CardLayout from "@/components/card-layout";
import { useCallback, useEffect, useState, useMemo } from "react";
import PostCard from "@/components/post-card";
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/components/home/actions";
import PostCardSkeleton from "@/components/post-card-skeleton";

export default function Posts() {
    const [scrollProgress, setScrollProgress] = useState(0)
    const [api, setApi] = useState<CarouselApi>()

    const { data: posts, isLoading: isPostsLoading } = useQuery({
        queryKey: ['posts-section'],
        queryFn: async () => {
            const { posts } = await getPosts({})
            return posts
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    const loadingArray = useMemo(() => Array.from({ length: 6 }), []);

    const onScroll = useCallback(() => {
        if (!api) return;
        
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
            const progress = Math.max(0, Math.min(1, api.scrollProgress()))
            setScrollProgress(progress * 100)
        });
    }, [api])
    
    useEffect(() => {
        if (!api) return
        
        onScroll()
        
        api.on('scroll', onScroll)
        api.on('reInit', onScroll)
        
        return () => {
            api.off('scroll', onScroll)
            api.off('reInit', onScroll)
        }
    }, [api, onScroll])
    
    if (posts && posts.length === 0) return null;
    
    return (
        <CardLayout
          title="Latest Posts"
          className="relative flex flex-col justify-center h-fit w-full"
          variant="home"
        >
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="
              absolute top-[25%] left-0
              -translate-x-1/3 -translate-y-1/3
              h-[300px] w-[300px]
              rounded-full bg-primary opacity-50 blur-[80px]
            "></div>
          </div>
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="
              absolute bottom-0 right-0
              translate-x-1/4 translate-y-1/4
              h-[300px] w-[200px]
              rounded-full bg-secondary opacity-50 blur-[80px]
            "></div>
          </div>
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full overflow-visible"
          >
            <div className="flex flex-col gap-3">
              <CarouselContent className="py-4 px-2">
                {isPostsLoading
                  ? loadingArray.map((_, idx) => (
                      <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
                        <PostCardSkeleton />
                      </CarouselItem>
                    ))
                  : posts?.map((post) => (
                      <CarouselItem
                        key={post.id}
                        className="flex items-center justify-center md:basis-1/2 lg:basis-1/3"
                      >
                        <PostCard post={post} />
                      </CarouselItem>
                    ))
                }
              </CarouselContent>
              <div className="flex flex-row items-center justify-between gap-4 mt-4">
                <div className="
                  flex-grow h-3 overflow-hidden
                  border-2 border-background rounded
                ">
                  <div
                    className="left-0 h-full transition-transfor duration-300 ease-out rounded bg-gradient-to-r to-primary from-secondary"
                    style={{
                      transform: `translateX(${scrollProgress - 100}%)`,
                      willChange: "transform"
                    }}
                  />
                </div>
                <div className="flex justify-center gap-4">
                  <CarouselPrevious variant="outline" className="static w-8 h-8 transform-none" />
                  <CarouselNext variant="outline" className="static w-8 h-8 transform-none" />
                </div>
              </div>
            </div>
          </Carousel>
        </CardLayout>
      )
}