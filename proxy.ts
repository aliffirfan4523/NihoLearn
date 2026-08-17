import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const PUBLIC_PATHS = ["/login", "/signup", "/terms", "/privacy", "/api/auth", "/_next", "/favicon.ico"];

export async function proxy(request: NextRequest) {
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
    requestHeaders.set("x-user-avatar", encodeURIComponent((user.user_metadata?.avatar_url as string) ?? ""));
    requestHeaders.set("x-user-provider", user.app_metadata?.provider ?? "email");

    // Forward customization metadata
    requestHeaders.set("x-user-knows-kana", user.user_metadata?.knows_kana ? "true" : "false");
    requestHeaders.set("x-user-vocab-goal", String(user.user_metadata?.daily_vocab_goal ?? 5));
    requestHeaders.set("x-user-grammar-goal", String(user.user_metadata?.daily_grammar_goal ?? 2));
    requestHeaders.set("x-user-japanese-level", encodeURIComponent((user.user_metadata?.japanese_level as string) ?? "Complete Beginner"));
    requestHeaders.set("x-user-profile-completed", user.user_metadata?.profile_completed ? "true" : "false");

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
