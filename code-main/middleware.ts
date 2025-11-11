import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  const pathname = request.nextUrl.pathname

  // Protected routes
  const protectedRoutes = ["/dashboard", "/admin"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Admin routes
  if (pathname.startsWith("/admin") && token) {
    try {
      const decoded = JSON.parse(Buffer.from(token, "base64").toString())
      if (decoded.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === "/login" || pathname === "/register") && token) {
    try {
      const decoded = JSON.parse(Buffer.from(token, "base64").toString())
      return NextResponse.redirect(new URL(decoded.role === "admin" ? "/admin" : "/dashboard", request.url))
    } catch {
      // Continue if token is invalid
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png).*)"],
}
