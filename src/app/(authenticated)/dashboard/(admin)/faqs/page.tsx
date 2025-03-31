import CreateService from "@/app/(authenticated)/dashboard/(admin)/faqs/_components/create-faq";
import { getFaqs } from "@/app/(authenticated)/dashboard/(admin)/faqs/actions";
import { faqTableColumns } from "@/app/(authenticated)/dashboard/(admin)/faqs/columns";
import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import StatCard from "@/app/(authenticated)/dashboard/_components/stat-cart";
import { DataTable } from "@/components/ui/data-table";
import { MessageCircleQuestion } from "lucide-react";

export default async function Faqs() {
    const faqs = await getFaqs();

    return (
        <DashboardLayout title="Manage Faqs">
            <StatCard
              title={'total faqs'}
              data={faqs.length}
              icon={<MessageCircleQuestion />}
            />
            <DataTable
                columns={faqTableColumns}
                data={faqs}
                filters={["question", "answer"]}
                bulkTableName="faq"
                hiddenColumns={["id"]}
            />
            <CreateService/>
        </DashboardLayout>
    )
}