import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// The LDEO branch is a demo of the search interface only. Block every page
// except /search and the /LDCR-... ID (landing) pages by redirecting to /search.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAllowed = pathname === "/search" || /^\/LDCR-/i.test(pathname);

  if (!isAllowed) {
    return NextResponse.redirect(new URL("/search", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals, API routes, the Tina admin,
  // and static assets (any path containing a ".").
  matcher: ["/((?!api|_next/static|_next/image|admin|favicon.ico|uploads|.*\\..*).*)"],
};
