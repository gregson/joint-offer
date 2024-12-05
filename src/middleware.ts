import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Si l'URL commence par /images/, on laisse passer la requête
  if (request.nextUrl.pathname.startsWith('/images/')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}
