import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const PUBLIC_PATHS = ["/login", "/signup", "/api/auth", "/_next", "/favicon.ico"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Forward mutated headers to Server Components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh the session (important for keeping cookies alive).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Forward user auth claims directly to Server Components to eliminate duplicate network auth calls
    requestHeaders.set("x-user-id", user.id);
    requestHeaders.set("x-user-email", user.email ?? "");
    requestHeaders.set(
      "x-user-name",
      encodeURIComponent(
        (user.user_metadata?.full_name as string) ??
          (user.user_metadata?.name as string) ??
          ""
      )
    );
    requestHeaders.set(
      "x-user-avatar",
      encodeURIComponent((user.user_metadata?.avatar_url as string) ?? "")
    );
    requestHeaders.set("x-user-provider", user.app_metadata?.provider ?? "email");

    // Re-create response with the enriched headers
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (isPublic) {
    // If already logged in and visiting /login, redirect to home.
    if (user && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return response;
  }

  // Protected route — redirect to login if no user.
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
