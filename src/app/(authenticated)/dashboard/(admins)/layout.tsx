import { getSession } from "@/lib/auth-client"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Layout({ children }: { children: React.ReactNode }) {
    const reqHeaders = await headers()

    const { data } = await getSession({
        fetchOptions: {
            headers: reqHeaders
        }
    })

    if (data?.user.role !== "admin") {
        return redirect("/")
    }

    return children;
}