import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const data = await auth.api.getSession({
      headers: await headers()
    })
    const user = data?.user

    if (!user && request.nextUrl.pathname.startsWith('/settings')) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if ((!user || user.role == 'user') && request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', request.url))
    }

  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  runtime: 'nodejs',
  matcher: [
    '/settings', 
    '/dashboard/:path*',
  ]
}