import { headers } from "next/headers";
import { getSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (session.data.user.role !== "admin") {
    redirect("/dashboard");
    return;
  }

  return <>{children}</>;
}