import { cookies, headers } from "next/headers";
import { getSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const reqHeaders = await headers()

  const { data } = await getSession({
    fetchOptions: {
      headers: reqHeaders
    }
  })

  if (data?.user.role != 'doctor') redirect('/dashboard/operations')

  return (
    {children}
  )
}