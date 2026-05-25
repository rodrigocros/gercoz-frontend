import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;
  const partialToken = request.cookies.get('partialToken')?.value;

  if (pathname.startsWith('/auth')) {
    if (accessToken) return NextResponse.redirect(new URL('/modulos', request.url));
    if (partialToken) return NextResponse.redirect(new URL('/empresas', request.url));
    return NextResponse.next();
  }

  if (pathname.startsWith('/empresas')) {
    if (partialToken) return NextResponse.next();
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // All other routes (including /modulos)
  if (accessToken) return NextResponse.next();
  if (partialToken) return NextResponse.redirect(new URL('/empresas', request.url));
  return NextResponse.redirect(new URL('/auth', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
