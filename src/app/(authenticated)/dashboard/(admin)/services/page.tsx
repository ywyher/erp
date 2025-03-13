import CreateService from "@/app/(authenticated)/dashboard/(admin)/services/_components/create-service";
import { serviceTableColumns } from "@/app/(authenticated)/dashboard/(admin)/services/columns";
import CardLayout from "@/components/card-layout";
import { DataTable } from "@/components/ui/data-table";
import { listServices } from "@/lib/db/queries";

export default async function Services() {
    const services = await listServices();

    return (
        <CardLayout title="Manage Services">
            <DataTable
                columns={serviceTableColumns}
                data={services}
                filters={["title", "content"]}
                bulkTableName="service"
                hiddenColumns={["id"]}
            />
            <CreateService/>
        </CardLayout>
    )
}