import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { canAccess, isStaffRoute } from "@/lib/permissions";

/**
 * Server-side gate for the staff console. Runs before any (protected) page is
 * rendered or shipped to the browser, so unauthenticated users never receive
 * the app bundle for those routes, and role denials happen on the server
 * instead of only hiding sidebar links.
 *
 * The patient portal (/portal/*) and /login are intentionally public here;
 * portal auth must be enforced by the backend once it replaces the mocks.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const segment = "/" + (pathname.split("/")[1] ?? "");

  if (!isStaffRoute(segment)) return NextResponse.next();

  const session = req.auth;
  if (!session?.user || !session.staff) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (!canAccess(session.staff.role, segment)) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|webmanifest)$).*)"],
};
