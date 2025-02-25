"use client"

import DocumentViewer from "@/app/(authenticated)/dashboard/operations/[operationId]/_components/document-viewer"
import OperationDataComponent from "@/app/(authenticated)/dashboard/operations/[operationId]/_components/operation-data"
import PatientData from "@/app/(authenticated)/dashboard/operations/[operationId]/_components/patient-data"
import { useDocumentStore } from "@/app/(authenticated)/dashboard/operations/[operationId]/store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  Consultation,
  Doctor,
  MedicalFile,
  Operation,
  OperationData as TOperationData,
  Prescription,
  User,
} from "@/lib/db/schema"
import { useEffect, useState } from "react"

type OperationTabs = {
  patient: User
  operationId: Operation["id"]
  editable: boolean
  operationDocument: string
  medicalFiles?: MedicalFile[]
  consultation?: Consultation
  operationData?: TOperationData
}

export default function OperationTabs({
  patient,
  operationId,
  medicalFiles,
  consultation,
  operationData,
  operationDocument,
  editable,
}: OperationTabs) {
  const [activeTab, setActiveTab] = useState<"patient-data" | "operation-data" | "document-viewer">("patient-data")

  const { setOperationData } = useDocumentStore()

  useEffect(() => {
    if(operationData && operationData.data) {
      setOperationData(operationData.data)
    }
  }, [operationData])

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
      <TabsList>
          <TabsTrigger value="patient-data">Patient's data</TabsTrigger>
          <TabsTrigger value="operation-data">Operation data</TabsTrigger>
          {operationData?.data && <TabsTrigger value="document-viewer">Document Viewer</TabsTrigger>}
      </TabsList>
      <TabsContent value="patient-data">
        <PatientData patient={patient} medicalFiles={medicalFiles} consultation={consultation} />
      </TabsContent>
      <TabsContent value="operation-data">
        <OperationDataComponent
          operationId={operationId}
          operationData={operationData}
          setActiveTab={setActiveTab}
          operationDocument={operationDocument}
          editable={editable}
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
  )
}