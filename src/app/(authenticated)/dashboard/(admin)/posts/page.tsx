import { postTableColumns } from "@/app/(authenticated)/dashboard/(admin)/posts/columns";
import CardLayout from "@/components/card-layout";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { listPosts } from "@/lib/db/queries";
import Link from "next/link";

export default async function Services() {
    const posts = await listPosts();

    return (
    <CardLayout title="Manage Posts" className="flex-1">
      {posts && (
        <div className="h-screen flex flex-col">
          <div className="flex-1">
            <DataTable
              columns={postTableColumns}
              data={posts}
              filters={["title", "content"]}
              bulkTableName="posts"
              hiddenColumns={["id", "slug"]}
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