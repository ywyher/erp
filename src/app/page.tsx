'use client'

import Header from "@/components/header"
import Seeder from "@/components/seeder"
import { getSession } from "@/lib/auth-client"
import { getUserRegistrationType } from "@/lib/db/queries"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const router = useRouter()
  const { data: user, isLoading } = useQuery({
    queryKey: ['session', 'home'],
    queryFn: async () => {
      const { data } = await getSession()
      return data?.user || null
    }
  })

  useEffect(() => {
    if(!user) return;
    (async () => {
      try {
        const registeredWith = await getUserRegistrationType(user.id)
        if (registeredWith === 'phoneNumber' && !user.phoneNumberVerified) {
          router.replace('/')
          return
        }
        if (registeredWith === 'email' && !user.emailVerified) {
          router.replace('/')
          return
        }
        if (user.onBoarding) {
          router.replace("/onboarding")
        }
      } catch (error) {
        console.error("Error in handleRules:", error)
      }
    })()
  }, [user, router]);

  return (
    <div>
      <Header />
      <Seeder />
    </div>
  )
}