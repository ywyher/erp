'use client'

import { createOperationData, extractPlaceholders, updateOperationData } from "@/app/(authenticated)/dashboard/operations/actions"
import { operationDataSchema } from "@/app/(authenticated)/dashboard/operations/types"
import { FormFieldWrapper } from "@/components/formFieldWrapper"
import LoadingBtn from "@/components/loading-btn"
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField
} from "@/components/ui/form"
import { Operation, OperationData as TOperationData } from "@/lib/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function OperationData({ 
    operationId,
    setLocalOperationData,
    setActiveTab,
    editable,
    operationDocument,
    operationData,
  }: { 
    operationId: Operation['id'], 
    setLocalOperationData: (newData: TOperationData) => void
    setActiveTab: Dispatch<SetStateAction<'operation-data' | 'patient-data' | 'document-viewer'>>
    editable: boolean
    operationDocument: string
    operationData?: TOperationData
   }) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [task] = useState<'create' | 'update'>(operationData && operationData.id ? 'update' : 'create')
  const [placeholders, setPlaceholders] = useState<string[]>()

  useEffect(() => { 
    (async () => {
      const result = await extractPlaceholders(operationDocument);
      setPlaceholders(result)
    })();
  }, [])

  const form = useForm({
    defaultValues: task === 'update' && operationData?.data ? operationData.data : {}
  })

  const handleOperationData = async (data: any) => {
    setIsLoading(true)

    let result;
    if(task == 'create') {
      result = await createOperationData({ data, operationId })
    }else {
      result = await updateOperationData({ data, operationDataId: operationData?.id as string })
    }

    if(!result.data || result.error) {
      toast.error(result.error)
      setIsLoading(false)
      return;
    }

    setActiveTab('document-viewer')
    setLocalOperationData(result.data)
    toast.message(result.message)
    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{task === 'create' ? 'Create' : 'Update'} Operation Data</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleOperationData)} className="space-y-6">
            {placeholders && placeholders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {placeholders.map((placeholder, index) => (
                  <FormFieldWrapper 
                    key={index}
                    form={form} 
                    name={placeholder} 
                    label={placeholder.replaceAll('_', ' ')}
                    disabled={!editable}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}
            {editable && (
              <LoadingBtn isLoading={isLoading} className="w-full">
                {task === 'create' ? 'Create' : 'Update'} Operation Data
              </LoadingBtn>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}