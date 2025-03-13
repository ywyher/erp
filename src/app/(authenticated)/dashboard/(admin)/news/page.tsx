import { newsTableColumns } from "@/app/(authenticated)/dashboard/(admin)/news/columns";
import CardLayout from "@/components/card-layout";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { listServices } from "@/lib/db/queries";
import Link from "next/link";

export default async function Services() {
    const news = await listServices();

    return (
    <CardLayout title="Manage News" className="flex-1">
      {news && (
        <div className="h-screen flex flex-col">
          <div className="flex-1">
            <DataTable
              columns={newsTableColumns}
              data={news}
              filters={["title", "content"]}
              bulkTableName="news"
              hiddenColumns={["id"]}
            />
          </div>
          <Button className="sticky bottom-4 p-4 shadow-md w-full">
            <Link href="/dashboard/news/create">
              Create News
            </Link>
          </Button>
        </div>
      )}
    </CardLayout>
    )
}