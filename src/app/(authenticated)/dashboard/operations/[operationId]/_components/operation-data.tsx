"use client";

import {
  createOperationData,
  extractPlaceholders,
  updateOperationData,
} from "@/app/(authenticated)/dashboard/operations/actions";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import LoadingBtn from "@/components/loading-btn";
import { Form } from "@/components/ui/form";
import { Operation, Preset, OperationData as TOperationData } from "@/lib/db/schema";
import { Dispatch, SetStateAction, useEffect, useState, useMemo, cache } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  placeholdersCache,
  useDocumentStore,
} from "@/app/(authenticated)/dashboard/operations/[operationId]/store";
import { useQuery } from "@tanstack/react-query";
import { getPreset } from "@/app/(authenticated)/dashboard/operations/[operationId]/actions";
import { operationDataSchema } from "@/app/(authenticated)/dashboard/operations/[operationId]/types";
import { z } from "zod";

export default function OperationData({
  presetId,
  operationId,
  setActiveTab,
  editable,
  operationDocument,
  operationData,
  task
}: {
  presetId: Preset['id'] | null;
  operationId: Operation["id"];
  setActiveTab: Dispatch<
    SetStateAction<"patient-data" | "operation-data" | "document-viewer">
  >;
  editable: boolean;
  operationDocument: string;
  operationData?: TOperationData;
  task: 'create' | 'update'
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [placeholders, setPlaceholders] = useState<string[]>();
  const [isLoadingPlaceholders, setIsLoadingPlaceholders] = useState(true);
  const { setOperationData, setNeedsRegeneration } = useDocumentStore();
  
  const form = useForm<z.infer<typeof operationDataSchema>>({
    defaultValues:
      task === "update" && operationData?.data ? {
        data: operationData?.data
      } : {},
  });

  const { data: preset, isLoading: isPresetLoading, error: presetError } = useQuery({
    queryKey: ['operation-preset', presetId],
    queryFn: async () => {
      if(presetId) {
        return await getPreset({ presetId })
      }else {
        return null
      }
    },
  })

  useEffect(() => {
    if(preset && !isPresetLoading && !presetError && preset.data) {
      form.reset({
        data: {
            ...(preset.data as Record<string, unknown>)
        }
      })
    }
  }, [preset])

  // Generate a cache key from the operationDocument
  const cacheKey = useMemo(() => {
    if(operationDocument) {
      return operationDocument;
    }else {
      return undefined;
    }
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
        console.log(`operationDocument`)
        console.log(operationDocument)
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

    if(cacheKey) {
      fetchPlaceholders();
    }
  }, [cacheKey]);

  const handleOperationData = async (data: z.infer<typeof operationDataSchema>) => {
    setIsLoading(true);

    form.reset({
        data: {
            ...data.data
        }
    });

    let result;
    if (task == "create") {
      result = await createOperationData({ data, operationId });
    } else {
      result = await updateOperationData({
        data,
        operationDataId: operationData?.id as string,
      });
    }

    if (!result.data || result.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    setNeedsRegeneration(true);
    setOperationData(result.data.data);
    setActiveTab("document-viewer");
    toast.message(result.message);
    setIsLoading(false);
  };

  return (
    <>
      {operationDocument ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleOperationData)}>
            {isLoadingPlaceholders ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-10 w-full" />
                ))}
              </div>
            ) : placeholders && placeholders.length > 0 ? (
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
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                No placeholders found in document
              </div>
            )}

            {editable && (
              <LoadingBtn isLoading={isLoading} className="mt-4">
                {task === "create" ? "Create" : "Update"} Operation Data
              </LoadingBtn>
            )}
          </form>
        </Form>
      ): (
        <p className="text-red-500 text-center">Document not uploaded, Contact the admin to upload the document!</p>
      )}
    </>
  );
}