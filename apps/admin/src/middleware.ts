import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// All admin routes require authentication (enforced server-side too,
// but this provides a fast client-side redirect)
export function middleware(request: NextRequest) {
  const token = request.cookies.get("tusome_admin_token")?.value;
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/login";

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
