import { getPosts } from "@/app/(authenticated)/dashboard/(admin)/posts/actions";
import { postTableColumns } from "@/app/(authenticated)/dashboard/(admin)/posts/columns";
import CardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import StatCard from "@/app/(authenticated)/dashboard/_components/stat-cart";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Newspaper } from "lucide-react";
import Link from "next/link";

export default async function Services() {
    const posts = await getPosts();

    return (
    <CardLayout title="Manage Posts" className="flex-1">
      {posts && (
        <div className="h-screen flex flex-col">
          <div className="flex-1">
            <StatCard
              title={'total services'}
              data={posts.length}
              icon={<Newspaper />}
            />
            <DataTable
              columns={postTableColumns}
              data={posts}
              filters={["title", "content"]}
              bulkTableName="post"
              hiddenColumns={["id", "slug"]}
              statusConfigType="posts"
            />
          </div>
          <Button className="sticky bottom-4 p-4 shadow-md w-full">
            <Link href="/dashboard/posts/create">
              Create A Post
            </Link>
          </Button>
        </div>
      )}
    </CardLayout>
  )
}