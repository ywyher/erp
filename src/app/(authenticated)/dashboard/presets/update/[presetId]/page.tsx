import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout"
import PresetData from "@/app/(authenticated)/dashboard/presets/_components/preset-data"
import { getPreset } from "@/app/(authenticated)/dashboard/presets/actions"
import { Preset } from "@/lib/db/schema"

export default async function UpdatePreset({ params: { presetId } }: { params: { presetId: Preset['id'] } }) {
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