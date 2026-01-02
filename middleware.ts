import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Cek apakah user mengakses halaman yang dilindungi
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('access_token')?.value;
    
    // Jika tidak ada token, redirect ke login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Jika user sudah login tapi coba akses /login, redirect ke admin
  if (pathname === '/login') {
    const token = request.cookies.get('access_token')?.value;
    if (token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
