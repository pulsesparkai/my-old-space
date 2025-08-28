import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RESERVED_SUBDOMAINS = [
  'app', 'auth', 'api', 'admin', 'cdn', 'img', 'static', 'www', 
  'support', 'status', 'mail', 'm', 'dev', 'test', 'stage'
];

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');
  const url = request.nextUrl.clone();
  
  if (!host) return NextResponse.next();
  
  // Extract subdomain
  const hostParts = host.split('.');
  
  // Check if this is a subdomain request to top8.io
  if (hostParts.length >= 3 && hostParts[hostParts.length - 2] === 'top8' && hostParts[hostParts.length - 1] === 'io') {
    const subdomain = hostParts[0];
    
    // Block reserved subdomains
    if (RESERVED_SUBDOMAINS.includes(subdomain)) {
      return NextResponse.redirect(new URL('/404', request.url));
    }
    
    // Rewrite subdomain to profile route
    url.pathname = `/u/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};