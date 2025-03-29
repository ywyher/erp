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

    // Use stale-while-revalidate pattern with a longer cache time
    const { data: posts, isLoading: isPostsLoading } = useQuery({
        queryKey: ['posts-section'],
        queryFn: async () => {
            const { posts } = await getPosts({})
            return posts
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    // Memoize empty array for loading skeleton
    const loadingArray = useMemo(() => Array.from({ length: 6 }), []);

    // Optimize scroll handler with throttling
    const onScroll = useCallback(() => {
        if (!api) return;
        
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
            const progress = Math.max(0, Math.min(1, api.scrollProgress()))
            setScrollProgress(progress * 100)
        });
    }, [api])
    
    // Optimize event listeners
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
    
    const gradient = (pos: 'middle' | 'top-left' | 'bottom-right') => {
      switch (pos) {
        case 'middle':
          return (
            <div className="absolute top-0 -z-10 h-full w-full bg-transparent">
              <div className="
                absolute left-1/2 top-1/2 
                -translate-x-1/2 -translate-y-1/2 
                h-[600px] w-[70%] 
                rounded-full bg-primary opacity-50 blur-[80px]
              "></div>
            </div>
          )
        break;
        case "top-left": 
          return (
            <div className="absolute top-0 -z-10 h-full w-full bg-transparent">
              <div className="
                absolute top-[25%] left-0 
                -translate-x-1/3 -translate-y-1/3
                h-[300px] w-[300px] 
                rounded-full bg-primary opacity-50 blur-[80px]">
              </div>
            </div>
          )
        break;
        case "bottom-right": 
          return (
            <div className="absolute top-0 -z-10 h-full w-full bg-transparent">
              <div className="
                absolute bottom-0 right-0
                -translate-x-1 -translate-y-1/3 
                h-[300px] w-[200px] 
                rounded-full bg-secondary opacity-50 blur-[80px]
              "></div>
            </div>
          )
        break;
        default:
          return <></>
        break;
      }
    }

    // Only render if we have posts
    if (posts && posts.length === 0) return null;
    
    return (
        <CardLayout
          title="Latest posts"
          className="relative flex flex-col justify-center h-screen w-full"
        >
          {gradient('top-left')}
          {gradient('bottom-right')}
          {/* {gradient('middle')} */}
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
                        className="md:basis-1/2 lg:basis-1/3"
                      >
                        <PostCard post={post} />
                      </CarouselItem>
                    ))
                }
              </CarouselContent>
              <div className="flex flex-row items-center justify-between gap-4 mt-4">
                <div className="flex-grow h-3 overflow-hidden border-2 rounded border-background">
                  <div
                    className="left-0 h-full transition-transform duration-300 ease-out rounded bg-gradient-to-r to-primary from-secondary"
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