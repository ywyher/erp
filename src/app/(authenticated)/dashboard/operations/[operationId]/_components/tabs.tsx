"use client"

import DocumentViewer from "@/app/(authenticated)/dashboard/operations/[operationId]/_components/document-viewer"
import OperationDataComponent from "@/app/(authenticated)/dashboard/operations/[operationId]/_components/operation-data"
import PatientData from "@/app/(authenticated)/dashboard/operations/[operationId]/_components/patient-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  Consultation,
  Doctor,
  MedicalFile,
  Operation,
  OperationData as TOperationData,
  Prescription,
  User,
  OperationData,
} from "@/lib/db/schema"
import { useEffect, useState } from "react"

type OperationTabs = {
  patient: User
  operationId: Operation["id"]
  doctorId: Doctor["id"]
  medicalFiles?: MedicalFile[]
  consultation?: Consultation
  prescriptions?: Prescription[]
  operationData?: TOperationData
}

export default function OperationTabs({
  patient,
  operationId,
  doctorId,
  medicalFiles,
  consultation,
  prescriptions,
  operationData,
}: OperationTabs) {
  const [localOperationData, setLocalOperationData] = useState<TOperationData>()
  const [activeTab, setActiveTab] = useState<'patient-data' | 'operation-data' | 'document-viewer'>('patient-data')

  useEffect(() => {
    if (operationData && operationData.id) {
      console.log(operationData)
      setLocalOperationData(operationData)
      setActiveTab("document-viewer")
    }
  }, [operationData])

  return (
    <>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
        <TabsList>
          <TabsTrigger value="patient-data">Patient's data</TabsTrigger>
          <TabsTrigger value="operation-data">Operation data</TabsTrigger>
          {localOperationData && <TabsTrigger value="document-viewer">Document Viewer</TabsTrigger>}
        </TabsList>
        <TabsContent value="patient-data">
          <PatientData patient={patient} medicalFiles={medicalFiles} consultation={consultation} />
        </TabsContent>
        <TabsContent value="operation-data">
          <OperationDataComponent
            operationId={operationId}
            operationData={operationData}
            setLocalOperationData={setLocalOperationData}
            setActiveTab={setActiveTab}
          />
        </TabsContent>
        {localOperationData && (
          <TabsContent value="document-viewer">
            <DocumentViewer operationData={localOperationData as OperationData} />
          </TabsContent>
        )}
      </Tabs>
    </>
  )
}

