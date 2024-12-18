'use client'

import LoadingBtn from "@/components/loading-btn";
import { Button } from "@/components/ui/button";
import { reset, seed } from "@/lib/db/seed";

import { Bean, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Seeder() {
    const [isSeedLoading, setIsSeedLoading] = useState<boolean>(false)
    const [isResetLoading, setIsResetLoading] = useState<boolean>(false)

    const seeder = async () => {

        if (isResetLoading) {
            toast.error('Seed in progress')
            return;
        }

        setIsSeedLoading(true)
        const { message, error } = await seed()

        if (message) {
            toast(message)
            setIsSeedLoading(false)
        }

        if (error) {
            toast.error(error as string)
            setIsSeedLoading(false)
        }
    }

    const reseter = async () => {

        if (isSeedLoading) {
            toast.error('Seed in progress')
            return;
        }

        setIsResetLoading(true)
        const { message, error } = await reset()

        if (message) {
            toast(message)
            setIsResetLoading(false)
        }

        if (error) {
            toast.error(error as string)
            setIsResetLoading(false)
        }
    }

    return (
        <div className="flex flex-row gap-2">
            <LoadingBtn isLoading={isSeedLoading} onClick={async () => await seeder()}>
                <Bean />
                Seed
            </LoadingBtn>
            <LoadingBtn isLoading={isResetLoading} variant={'destructive'} onClick={async () => await reseter()}>
                <Trash2 />
                Reset
            </LoadingBtn>
        </div>
    )
}