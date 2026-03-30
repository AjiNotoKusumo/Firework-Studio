// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { auth } from "@/lib/auth"

export async function proxy(request: NextRequest) {
  // 1. Check for the session cookie directly (Fastest way)
    const { pathname } = request.nextUrl;
    const sessionCookie = getSessionCookie(request); 

    
  // 2. If no cookie, they aren't logged in
    if (!sessionCookie) {
        if (pathname.startsWith("/api")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (pathname === "/" || pathname === "/login" || pathname === "/register") {
            return NextResponse.next();
        }

        return NextResponse.redirect(new URL("/login", request.url));
    }

    const session = await auth.api.getSession({ headers: request.headers });

    if (session && !session.user.onboardingComplete) {
        // Prevent infinite redirect loop if they are already on /onboarding
        if (pathname !== "/onboarding" && !pathname.startsWith("/api")) {
            return NextResponse.redirect(new URL("/onboarding", request.url));
        }

        return NextResponse.next();
    }

    // 4. Prevent users who ARE finished from going back to onboarding
    if (session?.user.onboardingComplete && pathname === "/onboarding") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if(pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/onboarding")) {
        if(sessionCookie) {
            return NextResponse.redirect(new URL("/", request.url))
        } else {
            return NextResponse.next()
        }
    }

    return NextResponse.next();
}

// 3. Only run this on your protected routes
export const config = {
  matcher: ["/dashboard/:path*", "/api/ai/:path*", "/api/posts/:path*", "/login", "/register", "/onboarding", "/"],
};
