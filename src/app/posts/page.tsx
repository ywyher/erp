"use client"
import PostCard from "@/components/post-card";
import PostCardSkeleton from "@/components/post-card-skeleton";
import PostFilters from "@/app/posts/_components/post-filters";
import { getPosts } from "@/app/posts/actionts";
import CardLayout from "@/components/card-layout";
import Header from "@/components/header";
import { Post } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";

// Import shadcn Pagination components
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Define posts per page constant
const POSTS_PER_PAGE = 3;

export default function Posts() {
  const [title] = useQueryState("title");
  const [authors] = useQueryState('authors', parseAsArrayOf(parseAsString));
  const [categories] = useQueryState('categories', parseAsArrayOf(parseAsString));
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  
  const { data, isLoading } = useQuery({
    queryKey: ["posts", authors, title, categories, page],
    queryFn: async () => {
      return await getPosts({ 
        authors, 
        title, 
        categories: categories as Post['category'][], 
        page, 
        limit: POSTS_PER_PAGE 
      });
    }
  });

  const posts = data?.posts;
  const totalPosts = data?.total || 0;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [title, authors, categories, setPage]);

  const generatePaginationItems = () => {
    // Always show first page, last page, current page,
    // one page before and after current page
    const items = [];
    
    // Add first page
    items.push(
      <PaginationItem key="page-1">
        <PaginationLink 
          href="#" 
          onClick={(e) => { e.preventDefault(); setPage(1); }}
          isActive={page === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // If there are many pages, we might need ellipsis
    if (page > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Pages around current page
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      // Skip if we've already added page 1 or will add the last page separately
      if (i === 1 || i === totalPages) continue;
      
      items.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink 
            href="#" 
            onClick={(e) => { e.preventDefault(); setPage(i); }}
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Another ellipsis if needed
    if (page < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Add last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink 
            href="#" 
            onClick={(e) => { e.preventDefault(); setPage(totalPages); }}
            isActive={page === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <>
      <Header />
      <CardLayout title="All Posts" className="flex flex-col gap-2">
        <div className="flex flex-col gap-5">
          <p className="text-gray-400">{totalPosts} posts found.</p>
          <PostFilters />
          
          {!posts || isLoading ? (
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
              {[1, 2, 3].map((index) => (
                <PostCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {posts.length ? (
                <>
                  <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                  
                  {totalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => { 
                              e.preventDefault(); 
                              if (page > 1) setPage(page - 1);
                            }}
                            className={page === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        
                        {generatePaginationItems()}
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => { 
                              e.preventDefault(); 
                              if (page < totalPages) setPage(page + 1);
                            }}
                            className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              ) : (
                <div className="bg-[#f9f9f9] dark:bg-[#121212] p-[4rem] w-full rounded-xl text-center border border-gray-300 dark:border-gray-700">
                  No Posts Found
                </div>
              )}
            </div>
          )}
        </div>
      </CardLayout>
    </>
  );
}