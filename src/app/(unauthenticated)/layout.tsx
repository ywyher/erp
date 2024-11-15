import { getSession } from "@/lib/auth-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const reqHeaders = await headers()

    const { data } = await getSession({
        fetchOptions: {
            headers: reqHeaders
        }
    })

    if (data?.user) {
        redirect('/');
        return null;
    }

    return <main>{children}</main>;
}
