import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout"
import PresetData from "@/app/(authenticated)/dashboard/presets/_components/preset-data"
import { getPreset } from "@/app/(authenticated)/dashboard/presets/actions"
import { Preset } from "@/lib/db/schema"

type Params = Promise<{ presetId: Preset['id'] }>

export default async function UpdatePreset({ params }: { params: Params }) {
    const { presetId } = await params
    const preset = await getPreset({ presetId })

    return (
        <DashboardLayout title="Update Preset" className="flex-1">
            {(preset) && (
                <PresetData
                    doctorId={preset.doctorId}
                    operationDocument={preset.documentName}
                    operation="update"
                    preset={preset}
                />
            )}
        </DashboardLayout>
    )
}