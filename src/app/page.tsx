'use client'

import Header from "@/components/header"
import { getSession } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"
import { redirect } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const { data: session, isLoading: isPending } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await getSession()
      return data
    }
  })

  useEffect(() => {
    if (!session || isPending) return;
    if (!session.user.emailVerified) redirect("/verify")
    else if (session.user.onBoarding) redirect("/onboarding")
  }, [session, isPending])

  return (
    <div>
      <Header />
    </div>
  )
}