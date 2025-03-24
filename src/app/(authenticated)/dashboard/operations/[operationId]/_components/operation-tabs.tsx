"use client";

import DocumentViewer from "@/app/(authenticated)/dashboard/operations/[operationId]/_components/document-viewer";
import OperationDataWrapper from "@/app/(authenticated)/dashboard/operations/[operationId]/_components/operation-data-wrapper";
import PatientData from "@/app/(authenticated)/dashboard/operations/[operationId]/_components/patient-data";
import { useDocumentStore } from "@/app/(authenticated)/dashboard/operations/[operationId]/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Consultation,
  Doctor,
  MedicalFile,
  Operation,
  OperationData as TOperationData,
  User,
} from "@/lib/db/schema";
import { useEffect, useState } from "react";

type OperationTabs = {
  patient: User;
  doctorId: Doctor['id']
  operationId: Operation["id"];
  editable: boolean;
  operationDocument: string;
  medicalFiles?: MedicalFile[];
  consultation?: Consultation;
  operationData?: TOperationData;
};

export default function OperationTabs({
  patient,
  doctorId,
  operationId,
  medicalFiles,
  consultation,
  operationData,
  operationDocument,
  editable,
}: OperationTabs) {
  const [activeTab, setActiveTab] = useState<
    "patient-data" | "operation-data" | "document-viewer"
  >("operation-data");

  const { setOperationData } = useDocumentStore();

  useEffect(() => {
    if (operationData && operationData.data) {
      setOperationData(operationData.data);
    }
  }, [operationData]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as typeof activeTab)}
      className="w-full pt-4"
    >
      <TabsList>
        <TabsTrigger value="patient-data">Patient's data</TabsTrigger>
        <TabsTrigger value="operation-data">Operation data</TabsTrigger>
        {operationData?.data && (
          <TabsTrigger value="document-viewer">Document Viewer</TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="patient-data" className="pt-2">
        <PatientData
          patient={patient}
          medicalFiles={medicalFiles}
          consultation={consultation}
        />
      </TabsContent>
      <TabsContent value="operation-data">
        <OperationDataWrapper
          doctorId={doctorId}
          operationId={operationId}
          operationDocument={operationDocument}
          operationData={operationData}
          editable={editable}
          setActiveTab={setActiveTab}
          task={operationData ? 'update' : 'create'}
        />
      </TabsContent>
      {operationData?.data && (
        <TabsContent value="document-viewer">
          <DocumentViewer
            operationDocument={operationDocument}
            key={JSON.stringify(operationData)} // This forces a re-render when data changes
          />
        </TabsContent>
      )}
    </Tabs>
  );
}