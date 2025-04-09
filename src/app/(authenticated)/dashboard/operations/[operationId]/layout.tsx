import { headers } from "next/headers";
import { getSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { Operation } from "@/lib/db/schema";
import { getOperationStatus } from "@/app/(authenticated)/dashboard/operations/actions";

type Params = Promise<{ operationId: Operation['id'] }>

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { operationId } = await params;

  const reqHeaders = await headers();

  // Validate session
  const session = await getSession({
    fetchOptions: {
      headers: reqHeaders,
    },
  });

  if (!session?.data) {
    console.error("Could not get session data");
    redirect("/login"); // Redirect to login if session is invalid
    return;
  }

  // Validate operation status
  const status = await getOperationStatus(operationId);

  if (!status) {
    console.error("Could not get operation status");
    redirect("/dashboard/operations"); // Redirect if operation status is invalid
    return;
  }

  // Check if the operation is completed or if the user is a doctor
  if (status !== "completed" && session.data.user.role !== "doctor") {
    redirect("/dashboard/operations");
    return;
  }

  return <>{children}</>;
}
