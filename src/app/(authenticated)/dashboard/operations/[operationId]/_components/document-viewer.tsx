import { Button } from "@/components/ui/button";
import { OperationData } from "@/lib/db/schema";
import { generateDocument } from "@/lib/document";

export default function DocumentViewer({ operationData }: { operationData: OperationData }) {
  return (
    <>
      <Button onClick={() => generateDocument({ data: operationData })}>Test</Button>
    </>
  )
}