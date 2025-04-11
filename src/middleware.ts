import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/settings']
}

export async function middleware(request: NextRequest) {
  try {
    const data = await auth.api.getSession({
      headers: await headers()
    })

    if (!data?.user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    return NextResponse.next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}