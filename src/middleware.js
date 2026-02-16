import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // bypass per file statici/next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(.*)$/) // es. .png .css .js
  ) {
    return NextResponse.next();
  }

  // Cookie sessione (tuo login)
  const session = request.cookies.get("session")?.value;
  const isLoggedIn = !!session;

  // Cookie pin (per pagina guadagni)
  const pinOk = request.cookies.get("pin_ok")?.value === "1";

  // Se sei già loggato, non ha senso vedere /login
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Rotte pubbliche (aggiungo anche /guadagni/pin e le api pin)
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/guadagni/pin" ||
    pathname.startsWith("/api/pin/")
  ) {
    return NextResponse.next();
  }

  // Proteggi tutto il resto con login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // A questo punto sei loggato: proteggi /guadagni con PIN
  if (pathname.startsWith("/guadagni")) {
    if (!pinOk) {
      return NextResponse.redirect(new URL("/guadagni/pin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
