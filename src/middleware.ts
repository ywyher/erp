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

    // If not logged in and trying to access settings page
    if (!user && request.nextUrl.pathname.startsWith('/settings')) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // For admin-only routes
    if (request.nextUrl.pathname.startsWith('/dashboard/admins') ||
        request.nextUrl.pathname.startsWith('/dashboard/doctors') ||
        request.nextUrl.pathname.startsWith('/dashboard/users') ||
        request.nextUrl.pathname.startsWith('/dashboard/receptionists') ||
        request.nextUrl.pathname.startsWith('/dashboard/services') ||
        request.nextUrl.pathname.startsWith('/dashboard/faqs') ||
        request.nextUrl.pathname.startsWith('/dashboard/settings')) {
      if (data?.user?.role != 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // For admin or doctor routes
    if (request.nextUrl.pathname.startsWith('/dashboard/presets')) {
      if (data?.user?.role != 'admin' && data?.user?.role !== 'doctor') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // General dashboard access (any other dashboard routes)
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