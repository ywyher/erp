'use client'

import Header from "@/components/header"
import { getSession } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"
import { redirect } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await getSession()
      return data
    }
  })

  useEffect(() => {
    if (session) {
      if (session.user.onBoarding) redirect("/onboarding")
      if (!session.user.emailVerified) redirect("/verify")
    }
  }, [session])

  return (
    <div>
      <Header />
    </div>
  )
}