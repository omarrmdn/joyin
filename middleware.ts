import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Proxy function (formerly Middleware) to handle internationalized routing and session management.
 * - If the URL starts with /ar or /en, it uses that locale.
 * - Otherwise, it internally rewrites the request to /en (default locale) while keeping the URL clean.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define supported locales
  const locales = ['en', 'ar']
  
  // Check if the pathname already starts with a supported locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  // Rewrite to default locale (en) for all other paths
  // This serves content from app/[lang]/... where lang is 'en'
  // but keeps the URL in the browser as joyin.online/path
  const url = request.nextUrl.clone()
  url.pathname = `/en${pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (project assets)
     * - fonts (fonts)
     * - public (public folder)
     * - auth (authentication routes)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|fonts|public|auth).*)',
  ],
}
