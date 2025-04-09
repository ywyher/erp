import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import StatCard from "@/app/(authenticated)/dashboard/_components/stat-cart";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Layers } from "lucide-react";
import Link from "next/link";
import { presetTableColumns } from "@/app/(authenticated)/dashboard/presets/columns";
import { getPresets } from "@/app/(authenticated)/dashboard/presets/actions";
import { getSession } from "@/lib/auth-client";
import { headers } from "next/headers";

export default async function Presets() {
    const { data } = await getSession({
            fetchOptions: {
            headers: await headers()
        }
    })

    if(!data?.user) throw new Error("Unauthenticated")

    const presets = await getPresets();

    let hiddenColumns = ["id"]
    let filterColumns = ["title"]

    if(data.user.role === 'admin') {
        filterColumns = [...filterColumns, "doctorName"]
    }
    if (data.user.role === "doctor") {
        hiddenColumns = [...hiddenColumns, "doctorName"]
    }

    return (
        <DashboardLayout 
            title="Manage Presets"
            // tip={`Presets allow you to save commonly used field entries for a document.\nOnce saved, you can quickly apply a preset to auto-populate the fields instead of entering the same information repeatedly.\nThis helps streamline your workflow and ensures consistency across similar documents.`}
            description="
                Presets allow you to save commonly used field entries for a document (the one used for the operation). 
                Once saved, you can quickly apply a preset to auto-populate the fields instead of entering the same information repeatedly. 
                This helps streamline your workflow and ensures consistency across similar documents.
            "
            className="flex-1"
        >
            {presets && (
                <div className="h-screen flex flex-col">
                <div className="flex-1">
                    <StatCard
                        title={'total presets'}
                        data={presets.length}
                        icon={<Layers />}
                    />
                    <DataTable
                        columns={presetTableColumns}
                        data={presets}
                        filters={filterColumns}
                        bulkTableName="preset"
                        hiddenColumns={hiddenColumns}
                    />
                </div>
                <Button className="sticky bottom-4 p-4 shadow-md w-full">
                    <Link href="/dashboard/presets/create">
                        Create A Preset
                    </Link>
                </Button>
                </div>
            )}
        </DashboardLayout>
    )
}