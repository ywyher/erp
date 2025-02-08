'use client'

import { createOperationData } from "@/app/(authenticated)/dashboard/operations/actions"
import { operationDataSchema } from "@/app/(authenticated)/dashboard/operations/types"
import { FormFieldWrapper } from "@/components/formFieldWrapper"
import LoadingBtn from "@/components/loading-btn"
import { Form } from "@/components/ui/form"
import { Operation } from "@/lib/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

export default function OperationData({ operationId }: { operationId: Operation['id'] }) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof operationDataSchema>>({
    resolver: zodResolver(operationDataSchema)
  })

  const handleOperationData = async (data: z.infer<typeof operationDataSchema>) => {
    setIsLoading(true)

    const { message, error } = await createOperationData({ data, operationId })

    if(error) {
      toast.error(error)
      setIsLoading(true)
      return;
    }

    toast.message(message)
    router.push('/dashboard/operations')
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleOperationData)} className="flex flex-col gap-2">
        <FormFieldWrapper form={form} name="one" label="One" />
        <FormFieldWrapper form={form} name="two" label="Two" />
        <FormFieldWrapper form={form} name="three" label="Three" />
        <LoadingBtn isLoading={isLoading}>
          Submit
        </LoadingBtn>
      </form>
    </Form>
  )
}