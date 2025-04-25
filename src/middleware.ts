import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Authentication temporairement désactivée pour les tests
  return NextResponse.next()
  
  /*
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })
    await supabase.auth.getSession()
    return res
  } catch (e) {
    return NextResponse.next()
  }
  */
}
