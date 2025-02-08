'use client'

import { createOperationData, updateOperationData } from "@/app/(authenticated)/dashboard/operations/actions"
import { operationDataSchema } from "@/app/(authenticated)/dashboard/operations/types"
import { FormFieldWrapper } from "@/components/formFieldWrapper"
import LoadingBtn from "@/components/loading-btn"
import { Form } from "@/components/ui/form"
import { Operation, OperationData as TOperationData } from "@/lib/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Dispatch, SetStateAction, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

export default function OperationData({ 
    operationId,
    operationData,
    setLocalOperationData,
    setActiveTab
  }: { 
    operationId: Operation['id'], 
    operationData?: TOperationData
    setLocalOperationData: Dispatch<SetStateAction<TOperationData | undefined>>
    setActiveTab: Dispatch<SetStateAction<'operation-data' | 'patient-data' | 'document-viewer'>>
   }) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [task] = useState<'create' | 'update'>(operationData && operationData.id ? 'update' : 'create')

  const form = useForm<z.infer<typeof operationDataSchema>>({
    resolver: zodResolver(operationDataSchema),
  })

  const handleOperationData = async (data: z.infer<typeof operationDataSchema>) => {
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleOperationData)} className="flex flex-col gap-2">
        <FormFieldWrapper 
         form={form}
         defaultValue={operationData?.id && operationData.one}
         name="one" label="One"
        />
        <FormFieldWrapper 
         form={form}
         defaultValue={operationData?.id && operationData.two}
         name="two" label="Two"
        />
        <FormFieldWrapper 
         form={form}
         defaultValue={operationData?.id && operationData.three}
         name="three" label="Three"
        />
        <LoadingBtn isLoading={isLoading}>
          Submit
        </LoadingBtn>
      </form>
    </Form>
  )
}