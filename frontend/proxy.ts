import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
    const session = request.cookies.get("sessionid");
    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/assessment/:path*",
        "/pretest/:path*",
        "/profile/:path*",
        "/chat/:path*",
        "/lessons/:path*",
    ],
};
