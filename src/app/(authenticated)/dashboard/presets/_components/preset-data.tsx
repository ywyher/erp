"use client"

import { extractPlaceholders } from "@/app/(authenticated)/dashboard/operations/actions";
import { CreatePreset, UpdatePreset } from "@/app/(authenticated)/dashboard/presets/actions";
import { presetSchema } from "@/app/(authenticated)/dashboard/presets/types";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import LoadingBtn from "@/components/loading-btn";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Doctor, OperationData, Preset } from "@/lib/db/schema"
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function PresetData({
    operationDocument,
    doctorId,
    operation,
    preset
}: {
    operationDocument: OperationData['documentName']
    doctorId: Doctor['id'],
    operation: "update" | "create",
    preset?: Preset
}) {
    const [placeholders, setPlaceholders] = useState<string[]>();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPlaceholders, setIsLoadingPlaceholders] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof presetSchema>>({
        resolver: zodResolver(presetSchema)
    })

    useEffect(() => {
        const fetchPlaceholders = async () => {
            setIsLoadingPlaceholders(true);
      
            try {
              const result = await extractPlaceholders(operationDocument);
              setPlaceholders(result);
            } catch (error) {
              toast.error("Failed to load document placeholders");
            } finally {
              setIsLoadingPlaceholders(false);
            }
        }

        fetchPlaceholders()
    }, [operationDocument])

    useEffect(() => {
        if(operation == 'update' && preset) {
            form.reset({
                title: preset.title,
                data: {
                    ...(preset.data as Record<string, unknown>)
                }
            })
        }
    }, [preset, operation])

    const handleOperationData = async (data: z.infer<typeof presetSchema>) => {
        setIsLoading(true);

        form.reset({
            title: data.title,
            data: {
                ...data.data
            }
        });

        let result;
        
        if(operation == 'create') {
            result = await CreatePreset({ data, doctorId, documentName: operationDocument });
        }
        if(operation == 'update' && preset && preset.id) {
            result = await UpdatePreset({ data, presetId: preset.id })
        }

        if(result?.error) {
            toast.error(result?.error)
            setIsLoading(false);
            return;
        }

        toast.success(result?.message)
        router.push('/dashboard/presets')
        setIsLoading(false);
    };
    
    if(isLoadingPlaceholders || !placeholders) return (
        <div className="p-4 space-y-6">
            {/* Main Fields */}
            <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-40 mx-auto" /> {/* Title Skeleton */}
                <Skeleton className="h-10 w-full" />
            </div>

            {/* Dynamic Fields */}
            <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-40 mx-auto" /> {/* Title Skeleton */}
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} className="h-10 w-full" />
                    ))}
                </div>
            </div>

            {/* Button */}
            <Skeleton className="h-12 w-40 mx-auto" />
        </div>
    )

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleOperationData)} className="flex flex-col gap-7">
                    <div className="flex flex-col gap-1">
                        <div className="text-xl font-bold text-center">Main Fields</div>
                        <FormFieldWrapper
                            form={form}
                            name={`title`}
                            label={"Title"}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="text-xl font-bold text-center">Dynamic Fields</div>
                        <div className="space-y-4">
                            {placeholders.map((placeholder, index) => (
                                <FormFieldWrapper
                                    key={index}
                                    form={form}
                                    name={`data.${placeholder}`}
                                    label={placeholder}
                                />
                            ))}
                        </div>
                    </div>
                    <LoadingBtn isLoading={isLoading} className="capitalize">
                        {operation} Create Preset
                    </LoadingBtn>
                </form>
            </Form>
        </div>
    )
}