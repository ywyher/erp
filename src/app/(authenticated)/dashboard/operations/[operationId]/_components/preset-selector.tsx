"use client"

import { getPresets } from "@/app/(authenticated)/dashboard/operations/[operationId]/actions"
import { Combobox } from "@/components/ui/combobox"
import { Doctor, Preset } from "@/lib/db/schema"
import { useQuery } from "@tanstack/react-query"
import { Dispatch, SetStateAction, useEffect } from "react"

type PresetSelectorProps = {
    doctorId: Doctor['id']
    setPreset: Dispatch<SetStateAction<Preset | null>>
    presets: Preset[]
}

export default function PresetSelector({
    doctorId,
    setPreset,
    presets
}: PresetSelectorProps) {
    return (
    )
}