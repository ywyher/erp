'use client'

import { useState, useEffect, useCallback } from "react"
import { getSession } from "@/lib/auth-client"
import { Input } from "@/components/ui/input"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { uploadPfp, uploadToS3 } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import Pfp from "@/components/pfp"
import { useImageStore } from "@/app/store"

export default function UploadPfp() {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>()
    const { toast } = useToast()
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
        // Clean up the object URL when the component unmounts or when the file changes
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

        const result = await uploadToS3({ file })

        if (!result) throw new Error('Failed to upload file')

        const pfpResult = await uploadPfp({
            fileName: result.fileName,
            userId: user.id,
            oldFileName: user.image || '',
        })

        if (pfpResult.success) {
            setFile(null)
            setPreviewUrl('')
            setTrigger(false)
            await queryClient.invalidateQueries({ queryKey: ['session'] })
            console.log('pfp updated !!')
            toast({
                title: 'Profile Picture Updated',
                description: 'Your profile picture was successfully updated.',
            })
        }
    }, [user, file, queryClient, setTrigger, toast])

    useEffect(() => {
        if (trigger) {
            handleUploadPfp()
        }
    }, [trigger, handleUploadPfp])

    if (!user || isPending) return

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