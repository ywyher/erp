"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { useDocumentStore } from "@/app/(authenticated)/dashboard/operations/[operationId]/store";

interface DocumentViewerProps {
  operationDocument: string;
}

export default function DocumentViewer({
  operationDocument,
}: DocumentViewerProps) {
  const router = useRouter();
  const {
    pdfUrl,
    docxUrl,
    isGenerating,
    error,
    generateDocuments,
    needsRegeneration,
    setNeedsRegeneration,
    operationData,
  } = useDocumentStore();

  // Effect to trigger document generation on first load or when data changes
  useEffect(() => {
    if (
      operationData &&
      (needsRegeneration || (!pdfUrl && !docxUrl && !isGenerating))
    ) {
      generateDocuments(operationData, operationDocument);
      setNeedsRegeneration(false);
    }
  }, [
    operationData,
    operationDocument,
    pdfUrl,
    docxUrl,
    isGenerating,
    needsRegeneration,
    generateDocuments,
    setNeedsRegeneration,
  ]);

  return (
    <div className="flex flex-col justify-between h-[calc(100vh-40px)]">
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">
                Generating document...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-destructive">
              <FileText className="h-8 w-8 mb-4" />
              <p>{error}</p>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-[60vh] border rounded-md"
            />
          ) : null}
        </CardContent>
        <CardFooter className="flex justify-end space-x-4 bg-muted/50 py-4 px-6">
          <Button variant="outline" asChild disabled={!docxUrl || isGenerating}>
            <a href={docxUrl ?? "#"} download="document.docx">
              <Download className="mr-2 h-4 w-4" /> Download DOCX
            </a>
          </Button>
          <Button asChild disabled={!pdfUrl || isGenerating}>
            <a href={pdfUrl ?? "#"} download="document.pdf">
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </a>
          </Button>
        </CardFooter>
      </Card>

      {/* End Operation Button */}
      <div className="w-full border-t p-4 flex items-end">
        <Button
          className="w-full"
          onClick={() => {
            toast.loading("Loading...", {
              duration: 3,
            });
            router.push("/dashboard/operations");
          }}
        >
          Done
        </Button>
      </div>
    </div>
  );
}
