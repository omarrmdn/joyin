import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// With Supabase Auth, session management is handled client-side.
// This proxy is kept minimal — add route protection here if needed.
export default function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
