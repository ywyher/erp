'use client'

import { useState, useEffect, useCallback } from "react"
import { getSession } from "@/lib/auth-client"
import { Input } from "@/components/ui/input"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { uploadPfp } from "@/app/actions"
import Pfp from "@/components/pfp"
import { useImageStore } from "@/app/store"
import { toast } from "sonner"
import { useFileUpload } from "@/hooks/use-upload-file"
import { Button } from "@/components/ui/button"
import LoadingBtn from "@/components/loading-btn"

export default function UploadPfp() {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const queryClient = useQueryClient()
    const setTrigger = useImageStore((state) => state.setTrigger)
    const { handleUpload, progresses } = useFileUpload()

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

    const handleUploadPfp = async () => {
        if (!user || !file) return;
        setIsLoading(true)

        const fileName = await handleUpload(file);

        if (!fileName) {
            setIsLoading(false);
            throw new Error('Failed to upload file');
        }

        const pfpResult = await uploadPfp({
            fileName,
            userId: user.id,
            oldFileName: user.image || '',
        })

        if (pfpResult.success) {
            setFile(null)
            setPreviewUrl('')
            setIsLoading(false)
            await queryClient.invalidateQueries({ queryKey: ['session'] })
            toast('Looking good :)')
        } else {
            toast.error('Failed to update profile picture')
        }
    }

    if (!user || isPending) return null

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5 w-full">
            <Pfp image={previewUrl ? previewUrl : user.image || ''} className="w-20 h-20 sm:w-24 sm:h-24" />
            <div className="grid grid-cols-3 gap-2 w-full">
                <Input
                    id="pfp-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full cursor-pointer text-sm sm:text-base col-span-2"
                />
                <LoadingBtn
                 className='w-full col-span-1' 
                 onClick={() => handleUploadPfp()}
                 disabled={!file ? true : false}
                 isLoading={isLoading}
                >
                    Upload
                </LoadingBtn>
            </div>
        </div>
    )
}