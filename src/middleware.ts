import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/*
 * File: src/proxy.ts
 * Purpose: Protect application routes based on authentication state.
 * Strategy:
 *  - If there is no `auth-storage` cookie and the path is not public -> redirect to /login
 *  - If there IS an `auth-storage` cookie and the user hits /login or /register -> redirect to /dashboard
 *
 * This matches the Web Frontend Implementation Plan and expects the auth store
 * to set/clear the `auth-storage` cookie on login/logout.
 */

const publicPaths = ["/login", "/register", "/"];

export function middleware(request: NextRequest) {
    const tokenCookie = request.cookies.get("auth-storage")?.value;
    const { pathname } = request.nextUrl;

    const isPublicPath = publicPaths.some((path) =>
        pathname === path || pathname.startsWith(path + "/")
    );

    // Redirect to login if not authenticated
    if (!tokenCookie && !isPublicPath) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect to dashboard if authenticated and on auth pages (but NOT on landing page)
    if (tokenCookie && (pathname === "/login" || pathname === "/register")) {
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
