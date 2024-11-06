'use client'

import { useState, useEffect, useCallback } from "react"
import { getSession } from "@/lib/auth-client"
import { Input } from "@/components/ui/input"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { uploadPfp, uploadToS3 } from "@/app/actions/index.actions"
import { useToast } from "@/hooks/use-toast"
import Pfp from "@/components/pfp"

export default function UploadPfp(
    {
        setIsUploadPfp,
        setTrigger,
        trigger = false
    }:
        {
            setIsUploadPfp?: React.Dispatch<React.SetStateAction<boolean>>
            setTrigger: React.Dispatch<React.SetStateAction<boolean>>
            trigger: boolean
        }) {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>()
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const { data: session } = useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const { data } = await getSession()
            return data
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
            if (setIsUploadPfp) setIsUploadPfp(true)
            setFile(selectedFile)
            const objectUrl = URL.createObjectURL(selectedFile)
            setPreviewUrl(objectUrl)
        }
    }

    const handleUploadPfp = useCallback(async () => {
        if (!session || !file) return

        const result = await uploadToS3({ file })

        if (!result) throw new Error('Failed to upload file')

        const pfpResult = await uploadPfp({
            fileName: result.fileName,
            userId: session.user.id,
            oldFileName: session.user.image,
        })

        if (pfpResult) {
            setFile(null)
            setPreviewUrl('')
            setTrigger(false)
            if (setIsUploadPfp) setIsUploadPfp(false)
            await queryClient.invalidateQueries({ queryKey: ['session'] })
            toast({
                title: 'Profile Picture Updated',
                description: 'Your profile picture was successfully updated.',
            })
        }
    }, [session, file, queryClient, setIsUploadPfp, setTrigger, toast])

    useEffect(() => {
        if (trigger) {
            handleUploadPfp()
        }
    }, [trigger, handleUploadPfp])

    if (!session) throw new Error('Not authenticated')

    return (
        <div>
            <div className="flex flex-row items-center gap-5 w-full space-y-4">
                <div>
                    <Pfp image={previewUrl ? previewUrl : session.user.image} />
                </div>
                <div>
                    <Input
                        id="pfp-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                    />
                </div>
            </div>
        </div>
    )
}