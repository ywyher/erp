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
} from "@/lib/db/schema"
import { generateDocument } from "@/lib/document"
import { getFileUrl } from "@/lib/funcs"
import { useEffect, useState, useCallback } from "react"

type OperationTabs = {
  patient: User
  operationId: Operation["id"]
  doctorId: Doctor["id"]
  editable: boolean
  operationDocument: string
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
  operationDocument,
  editable,
}: OperationTabs) {
  const [localOperationData, setLocalOperationData] = useState<TOperationData | undefined>(operationData)
  const [activeTab, setActiveTab] = useState<"patient-data" | "operation-data" | "document-viewer">("patient-data")
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined)
  const [docxUrl, setDocxUrl] = useState<string | undefined>(undefined)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsRegeneration, setNeedsRegeneration] = useState(false)

  useEffect(() => {
    if (operationData && operationData.id) {
      setLocalOperationData(operationData)
      // setActiveTab("document-viewer")
    }
  }, [operationData])

  const generateDocuments = useCallback(async () => {
    if (!localOperationData) return

    try {
      setIsGenerating(true)
      setError(null)

      // Generate DOCX Blob
      const generatedDocument = await generateDocument({ data: localOperationData.data, filePath: getFileUrl(operationDocument) })
      if(!generatedDocument) return;
      const docxFile = new File([generatedDocument.blob], "document.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
      setDocxUrl(URL.createObjectURL(generatedDocument.blob))

      // Convert DOCX to PDF via API
      const formData = new FormData()
      formData.append("file", docxFile)

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to convert DOCX to PDF")

      // Create Object URL for PDF display
      const pdfBlob = await response.blob()
      setPdfUrl(URL.createObjectURL(pdfBlob))
      setNeedsRegeneration(false)
    } catch (error) {
      console.error("Error generating and converting document:", error)
      setError("An error occurred while generating the document. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }, [localOperationData])

  useEffect(() => {
    if (localOperationData && (needsRegeneration || (!pdfUrl && !docxUrl && !isGenerating))) {
      generateDocuments()
    }
  }, [localOperationData, pdfUrl, docxUrl, isGenerating, needsRegeneration, generateDocuments])

  const handleSetLocalOperationData = (newData: TOperationData) => {
    setLocalOperationData(newData)
    setNeedsRegeneration(true)
  }


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
            setLocalOperationData={handleSetLocalOperationData}
            setActiveTab={setActiveTab}
            operationDocument={operationDocument}
            editable={editable}
          />
        </TabsContent>
        {localOperationData && (
          <TabsContent value="document-viewer">
            <DocumentViewer pdfUrl={pdfUrl} docxUrl={docxUrl} isGenerating={isGenerating} error={error} />
          </TabsContent>
        )}
      </Tabs>
    </>
  )
}