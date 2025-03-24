"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/plate-ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPresets } from "@/app/(authenticated)/dashboard/operations/[operationId]/actions";
import OperationDataComponent from "@/app/(authenticated)/dashboard/operations/[operationId]/_components/operation-data";
import type { Doctor, Operation, OperationData, Preset } from "@/lib/db/schema";
import { ArrowLeft } from "lucide-react";

type TOperationDataWrapper = {
  doctorId: Doctor['id'];
  operationId: Operation["id"];
  operationDocument: string;
  operationData?: OperationData;
  editable: boolean;
  setActiveTab: Dispatch<SetStateAction<"patient-data" | "operation-data" | "document-viewer">>;
  task: 'create' | 'update'
};

export default function OperationDataWrapper({
  doctorId,
  operationId,
  operationDocument,
  operationData,
  editable,
  setActiveTab,
  task
}: TOperationDataWrapper) {
  const [presetId, setPresetId] = useState<Preset['id']>('');
  const [next, setNext] = useState<boolean>(false);

  const { 
    data: presets, 
    isLoading: isPresetsLoading, 
    error: presetsError 
  } = useQuery({
    queryKey: ['presets', doctorId],
    queryFn: async () => await getPresets({ doctorId })
  });

  useEffect(() => {
    if (presets && presets.filter((preset) => preset.documentName == operationDocument).length == 0) {
      setNext(true);
    }
  }, [presets, operationDocument]);

  const filteredPresets = presets?.filter((preset) => preset.documentName == operationDocument) || [];

  if (isPresetsLoading) {
    return (
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-7 w-[100px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (filteredPresets.length > 0 && !presetId && !next) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Choose your preset</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Combobox
            placeholder="Select a preset"
            options={filteredPresets.map((preset) => ({
              value: preset.id,
              label: preset.title
            }))}
            onChange={(e) => {
              setPresetId(e);
              setNext(true);
            }}
          />
          <Separator />
          <Button onClick={() => setNext(true)}>Or Continue without one</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <Button
         variant='ghost'
         className="w-fit text-md ps-0"
         size='lg'
         onClick={() => {
          setPresetId('')
          setNext(false)
         }}
        >
          <ArrowLeft />
          Choose a different preset
        </Button>
        <CardTitle className="text-xl">{task === "create" ? "Insert" : "Update"} Data</CardTitle>
      </CardHeader>
      <CardContent>
        <OperationDataComponent
          presetId={presetId}
          operationId={operationId}
          operationData={operationData}
          setActiveTab={setActiveTab}
          operationDocument={operationDocument}
          editable={editable}
          task={task}
        />
      </CardContent>
    </Card>
  );
}