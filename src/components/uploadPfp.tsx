'use client'

import { useState, useEffect, useCallback } from "react"
import { getSession } from "@/lib/auth-client"
import { Input } from "@/components/ui/input"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { uploadPfp, uploadToS3 } from "@/app/actions"
import Pfp from "@/components/pfp"
import { useImageStore } from "@/app/store"
import { toast } from "sonner"

export default function UploadPfp() {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>()
    const queryClient = useQueryClient()
    const trigger = useImageStore((state) => state.trigger)
    const setTrigger = useImageStore((state) => state.setTrigger)

    const { data: user, isLoading: isPending } = useQuery({
        queryKey: ['session', 'uploadPfp'],
        queryFn: async () => {
            const { data } = await getSession()
            return data?.user || null
        }
    })

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] ?? null

        if (selectedFile) {
            setFile(selectedFile)
            const objectUrl = URL.createObjectURL(selectedFile)
            setPreviewUrl(objectUrl)
        }
    }

    const handleUploadPfp = useCallback(async () => {
        if (!user || !file) return

        const result = await uploadToS3({ files: file })

        if (!result || result.length === 0 || 'error' in result[0]) {
            toast.error('Failed to upload file')
            return;
        }

        const pfpResult = await uploadPfp({
            fileName: result[0].fileName,
            userId: user.id,
            oldFileName: user.image || '',
        })

        if (pfpResult.success) {
            setFile(null)
            setPreviewUrl('')
            setTrigger(false)
            await queryClient.invalidateQueries({ queryKey: ['session'] })
            console.log('pfp updated !!')
            toast('Your profile picture was successfully updated.')
        } else {
            toast.error('Failed to update profile picture')
        }
    }, [user, file, queryClient, setTrigger])

    useEffect(() => {
        if (trigger) {
            handleUploadPfp()
        }
    }, [trigger, handleUploadPfp])

    if (!user || isPending) return null

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5 w-full">
            <Pfp image={previewUrl ? previewUrl : user.image || ''} className="w-20 h-20 sm:w-24 sm:h-24" />
            <Input
                id="pfp-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full cursor-pointer text-sm sm:text-base"
            />
        </div>
    )
}