"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ChevronRight, CircleAlert, Home } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from "next/link"

type DashboardLayoutProps = {
  children: React.ReactNode
  title?: string
  className?: string
  tip?: string
  description?: string
}

export default function DashboardLayout({ 
   children,
   title,
   className = "",
   tip = "",
   description = "",
  }: DashboardLayoutProps) {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  return (
    <Card
      // max-w-[1200px]
      className={`
        relative shadow-lg rounded-xl w-full mx-auto my-4 me-4 flex flex-col
        border-border/40 bg-card/95 backdrop-blur-sm
        transition-all duration-200 ease-in-out
        overflow-x-scroll
        h-[calc(100vh-2rem)]
        ${className}
      `}
    >
      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between p-4 pt-2 pb-1 border-b border-border/30">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="h-8 w-8 shrink-0 bg-background/80 hover:bg-background" />
          <Breadcrumb>
            <BreadcrumbList className="flex-wrap">
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                  <Home size={16} />
                  <span className="sr-only sm:not-sr-only sm:inline-block text-xs font-medium">Home</span>
                </BreadcrumbLink>
              </BreadcrumbItem>

              {segments.map((segment, index) => {
                const href = "/" + segments.slice(0, index + 1).join("/")
                const isLastItem = index === segments.length - 1

                return (
                  <React.Fragment key={index}>
                    <BreadcrumbSeparator>
                      <ChevronRight size={14} className="text-muted-foreground/50" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      {isLastItem ? (
                        // <BreadcrumbLink></BreadcrumbLink>
                        <Link className="capitalize font-medium text-foreground" href={href}>
                          {segment.replace(/-/g, " ")}
                        </Link>
                      ) : (
                        <Link className="capitalize text-muted-foreground hover:text-primary" href={href}>
                          {segment.replace(/-/g, " ")}
                        </Link>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {/* You can add action buttons here */}
      </div>
      <div className="flex flex-col gap-3">
        {title && (
          <CardHeader className="pt-4 ps-5 pb-0">
            <CardTitle className="flex flex-row gap-2 items-center text-xl font-semibold tracking-tight">
              <div>
                {title}
              </div>
              {tip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><CircleAlert size={18} /></TooltipTrigger>
                    <TooltipContent>
                      {tip?.split("\n").map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </CardHeader>
        )}
        <CardContent className="flex-1 px-5">
          <div className="bg-background rounded-lg h-full">{children}</div>
        </CardContent>
      </div>
    </Card>
  )
}