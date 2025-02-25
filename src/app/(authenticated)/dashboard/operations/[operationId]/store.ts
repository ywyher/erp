// documentStore.ts
"use client"

import { create } from 'zustand'
import { generateDocument } from "@/lib/document"
import { getFileUrl } from "@/lib/funcs"
import { OperationData } from '@/lib/db/schema'

interface DocumentState {
  // Document state
  pdfUrl: string | undefined
  docxUrl: string | undefined
  isGenerating: boolean
  error: string | null
  needsRegeneration: boolean
  operationData: OperationData['data'] | undefined
  
  // Actions
  setOperationData: (value: DocumentState['operationData']) => void
  setNeedsRegeneration: (value: boolean) => void
  generateDocuments: (operationData: OperationData['data'], operationDocument: string) => Promise<void>
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  pdfUrl: undefined,
  docxUrl: undefined,
  isGenerating: false,
  error: null,
  needsRegeneration: false,
  operationData: undefined,
  
  setNeedsRegeneration: (value) => set({ needsRegeneration: value }),
  setOperationData: (value: DocumentState['operationData']) => set({ operationData: value }),
  
  generateDocuments: async (operationData, operationDocument) => {
    if (!operationData) return;
    
    // Skip if already generating
    if (get().isGenerating) return;
    
    try {
      set({ isGenerating: true, error: null });
      
      // Generate DOCX Blob
      const generatedDocument = await generateDocument({
        data: operationData,
        filePath: getFileUrl(operationDocument),
      });
      
      if (!generatedDocument) return;
      
      const newDocxBlobUrl = URL.createObjectURL(generatedDocument.blob);
      
      // Convert DOCX to PDF
      const formData = new FormData();
      formData.append("file", new File(
        [generatedDocument.blob], 
        "document.docx", 
        { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
      ));
      
      const response = await fetch("/api/convert", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Failed to convert DOCX to PDF");
      
      const pdfBlob = await response.blob();
      const newPdfBlobUrl = URL.createObjectURL(pdfBlob);
      
      set({ 
        docxUrl: newDocxBlobUrl,
        pdfUrl: newPdfBlobUrl,
        needsRegeneration: false,
        isGenerating: false
      });
      
    } catch (error) {
      console.error("Error generating and converting document:", error);
      set({ 
        error: "An error occurred while generating the document. Please try again.",
        isGenerating: false
      });
    }
  }
}));

// Create a cache object for placeholders
export const placeholdersCache = new Map();