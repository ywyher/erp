'use client'

import { createOperationData, extractPlaceholders, updateOperationData } from "@/app/(authenticated)/dashboard/operations/actions"
import { FormFieldWrapper } from "@/components/formFieldWrapper"
import LoadingBtn from "@/components/loading-btn"
import { Form } from "@/components/ui/form"
import { Operation, OperationData as TOperationData } from "@/lib/db/schema"
import { Dispatch, SetStateAction, useEffect, useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { placeholdersCache, useDocumentStore } from "@/app/(authenticated)/dashboard/operations/[operationId]/store"

export default function OperationData({
  operationId,
  setActiveTab,
  editable,
  operationDocument,
  operationData,
}: {
  operationId: Operation['id'],
  setActiveTab: Dispatch<SetStateAction<"patient-data" | "operation-data" | "document-viewer">>
  editable: boolean
  operationDocument: string
  operationData?: TOperationData
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [task] = useState<'create' | 'update'>(operationData && operationData.id ? 'update' : 'create')
  const [placeholders, setPlaceholders] = useState<string[]>()
  const [isLoadingPlaceholders, setIsLoadingPlaceholders] = useState(true)
  const { setOperationData ,setNeedsRegeneration } = useDocumentStore()

  // Generate a cache key from the operationDocument
  const cacheKey = useMemo(() => {
    return operationDocument;
  }, [operationDocument]);

  useEffect(() => {
    const fetchPlaceholders = async () => {
      setIsLoadingPlaceholders(true);
      
      // Check if we have a cached version first
      if (placeholdersCache.has(cacheKey)) {
        setPlaceholders(placeholdersCache.get(cacheKey));
        setIsLoadingPlaceholders(false);
        return;
      }
      
      try {
        const result = await extractPlaceholders(operationDocument);
        
        // Store in cache
        placeholdersCache.set(cacheKey, result);
        
        setPlaceholders(result);
      } catch (error) {
        console.error("Failed to extract placeholders:", error);
        toast.error("Failed to load document placeholders");
      } finally {
        setIsLoadingPlaceholders(false);
      }
    };

    fetchPlaceholders();
  }, [cacheKey]);

  const form = useForm({
    defaultValues: task === 'update' && operationData?.data ? operationData.data : {}
  })

  const handleOperationData = async (data: any) => {
    setIsLoading(true)
    let result;
    if(task == 'create') {
      result = await createOperationData({ data, operationId })
    } else {
      result = await updateOperationData({ data, operationDataId: operationData?.id as string })
    }
    
    if(!result.data || result.error) {
      toast.error(result.error)
      setIsLoading(false)
      return;
    }
    
    setNeedsRegeneration(true)
    setOperationData(result.data.data)
    setActiveTab('document-viewer')
    toast.message(result.message)
    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{task === 'create' ? 'Insert' : 'Update'} Data</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleOperationData)}>
            {isLoadingPlaceholders ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : placeholders && placeholders.length > 0 ? (
              <div className="space-y-4">
                {placeholders.map((placeholder, index) => (
                  <FormFieldWrapper
                    key={index}
                    form={form}
                    name={placeholder}
                    label={placeholder}
                  />
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                No placeholders found in document
              </div>
            )}
            
            {editable && (
              <LoadingBtn 
                isLoading={isLoading} 
                className="mt-4" 
              >
                {task === 'create' ? 'Create' : 'Update'} Operation Data
              </LoadingBtn>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}