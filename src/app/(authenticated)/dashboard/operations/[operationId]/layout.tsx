import { headers } from "next/headers";
import { getSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { Operation } from "@/lib/db/schema";
import { getOperationStatus } from "@/app/(authenticated)/dashboard/operations/actions";
import { Metadata } from "next";

type Params = Promise<{ operationId: Operation['id'] }>

type LayoutProps = {
  children: React.ReactNode;
  params: Params;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { operationId } = await params;

  return {
    title: "Operation Details | Dashboard | Perfect Health",
    description: "Modify an existing operation's details, timing, or status.",
    keywords: ['details operation', 'details booking', 'health dashboard'],
    openGraph: {
      title: "Operation Details | Dashboard | Perfect Health",
      description: "Details or reschedule operations through the dashboard tools.",
      url: `https://perfect-health.net/dashboard/operations/${operationId}`,
      siteName: "Perfect Health",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Operation Details | Perfect Health",
      description: "Manage and modify existing operations efficiently.",
    },
  };
}

export default async function OperationDetailsLayout({
  children,
  params,
}: LayoutProps) {
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
    redirect("/"); // Redirect to login if session is invalid
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
