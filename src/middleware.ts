import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next()

  // Remove any Content-Security-Policy headers that might allow Osano
  response.headers.delete('Content-Security-Policy')

  // Add a strict Content-Security-Policy that blocks unwanted scripts
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' data: https:;"
  )

  return response
}

export const config = {
  matcher: '/:path*',
} 