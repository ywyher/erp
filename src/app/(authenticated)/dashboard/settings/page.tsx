import OperationDocumentUrl from "@/app/(authenticated)/dashboard/settings/_components/operation-document-url";
import { getSession } from "@/lib/auth-client";
import db from "@/lib/db";
import { getOperationDocument } from "@/lib/db/queries";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { forbidden } from "next/navigation";

const getCurrentSettings = async () => {
  const operationDocument = await getOperationDocument()

  return {
    operationDocument
  }
}

export default async function Settings() {
  const { data } = await getSession({
      fetchOptions: {
          headers: await headers()
      }
  })

  if (!data) return forbidden();

  const { 
    operationDocument
  } = await getCurrentSettings();

  return (
    <div className="w-full">
      <OperationDocumentUrl
        userId={data.user.id}
        currentUrl={operationDocument}
      />
    </div>
  )
}