import CreateService from "@/app/(authenticated)/dashboard/(admin)/services/_components/create-service";
import { getServices } from "@/app/(authenticated)/dashboard/(admin)/services/actions";
import { serviceTableColumns } from "@/app/(authenticated)/dashboard/(admin)/services/columns";
import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import StatCard from "@/app/(authenticated)/dashboard/_components/stat-cart";
import { DataTable } from "@/components/ui/data-table";
import { Bell } from "lucide-react";

export default async function Services() {
    const services = await getServices();

    return (
        <DashboardLayout title="Manage Services">
            <StatCard
              title={'total services'}
              data={services.length}
              icon={<Bell />}
            />
            <DataTable
                columns={serviceTableColumns}
                data={services}
                filters={["title", "content"]}
                bulkTableName="service"
                hiddenColumns={["id"]}
            />
            <CreateService/>
        </DashboardLayout>
    )
}