import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const isDev = process.env.NODE_ENV === 'development';

  const styleDev = `'self' 'unsafe-inline'`;
  const styleProd = `'nonce-${nonce}' 'self'`;

  const scriptDev = `'self' 'unsafe-inline' 'unsafe-eval'`;
  const scriptProd = `'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const cspHeader = `
      default-src 'self';
      connect-src 'self' blob:;
      script-src ${isDev ? scriptDev : scriptProd};
      style-src ${isDev ? styleDev : styleProd};
      img-src    'self' data: blob:;
      font-src   'self';
      object-src 'none';
      base-uri   'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
      worker-src 'self' blob:;
      manifest-src 'self';
      media-src 'self' blob:;
      frame-src 'self';
  `;
  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  requestHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue,
  );

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue,
  );

  return response;
}

export const config = {
  matcher: [
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
