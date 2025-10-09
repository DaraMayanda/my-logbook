// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // WAJIB: Ini membaca dan me-refresh cookie sesi, menghentikan error sinkronisasi
  await supabase.auth.getSession(); 
  
  return res;
}

export const config = {
  // Melindungi semua route kecuali files statis/API.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], 
};