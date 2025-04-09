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
import { useQuery } from "@tanstack/react-query";
import { getServices } from "@/app/(authenticated)/dashboard/(admin)/services/actions";
import ServiceCard from "@/components/service-card";
import { IconName } from "@/components/icons-selector";
import ServiceCardSkeleton from "@/components/service-card-skeleton";
import { gradient } from "@/lib/gradiant";

export default function Services() {
    const [scrollProgress, setScrollProgress] = useState(0)
    const [api, setApi] = useState<CarouselApi>()

    const { data: services, isLoading: isServicesLoading } = useQuery({
        queryKey: ['services-section'],
        queryFn: async () => {
            const services = await getServices()
            return services
        },
        staleTime: 5 * 60 * 1000,
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
    
    if (services && services.length === 0) return null;
    
    return (
        <CardLayout
          title="Our Services"
          className="relative flex flex-col justify-center h-fit w-full"
          variant="home"
        >
          {gradient('middle')}
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
                {isServicesLoading
                  ? loadingArray.map((_, idx) => (
                      <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
                        <ServiceCardSkeleton />
                      </CarouselItem>
                    ))
                  : services?.map((service) => (
                      <CarouselItem
                        key={service.id}
                        className="flex items-center justify-center md:basis-1/2 lg:basis-1/3"
                      >
                        <ServiceCard
                            icon={service.icon as IconName}
                            title={service.title}
                        />
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