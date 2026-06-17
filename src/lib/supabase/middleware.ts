import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];
const PUBLIC_PREFIXES = [
  "/",
  "/tarifs",
  "/cgu",
  "/confidentialite",
  "/mentions-legales",
  "/rgpd",
  "/auth/callback",
  "/reset-password",
];

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

function isPublicRoute(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((p) => p !== "/" && pathname.startsWith(p));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api");

  // Non connecté sur une route protégée → /login
  if (!user && !isAuthRoute(pathname) && !isPublicRoute(pathname) && !isApi) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Connecté sur une route d'auth → /categories
  if (user && isAuthRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/categories";
    return NextResponse.redirect(url);
  }

  // Connecté mais email non confirmé → /login?unverified=1
  if (user && !user.email_confirmed_at && !isAuthRoute(pathname) && !isPublicRoute(pathname) && !isApi) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("unverified", "1");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
