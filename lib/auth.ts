import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { cache } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side Supabase client that reads/writes cookies via @supabase/ssr.
export async function getSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — can't set cookies.
        }
      },
    },
  });
}

export type AuthedUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  provider: string;
};

/**
 * Helper: Parses a JWT token payload without network overhead.
 */
function parseJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * Zero-latency user resolver:
 * 1. Checks forwarded middleware request headers (0ms)
 * 2. Checks and parses Supabase JWT cookie (0ms)
 * 3. Fallback to Supabase Auth API if needed
 */
export const getCurrentUser = cache(async (): Promise<AuthedUser | null> => {
  try {
    // 1. Fast path: Read forwarded headers from middleware
    const headerStore = await headers();
    const headerUserId = headerStore.get("x-user-id");

    if (headerUserId) {
      const email = headerStore.get("x-user-email") ?? "";
      const rawName = headerStore.get("x-user-name");
      const name = rawName ? decodeURIComponent(rawName) || null : null;
      const rawAvatar = headerStore.get("x-user-avatar");
      const avatarUrl = rawAvatar ? decodeURIComponent(rawAvatar) || null : null;
      const provider = headerStore.get("x-user-provider") ?? "email";

      return {
        id: headerUserId,
        email,
        name,
        avatarUrl,
        provider,
      };
    }

    // 2. Fast path: Parse Supabase session cookie directly (0 network requests!)
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const authCookie = allCookies.find((c) => c.name.includes("-auth-token"));

    if (authCookie && authCookie.value) {
      let rawToken = authCookie.value;
      // Handle chunked or JSON cookies
      if (rawToken.startsWith("base64-")) {
        rawToken = Buffer.from(rawToken.replace("base64-", ""), "base64").toString("utf-8");
      }
      try {
        const parsed = JSON.parse(rawToken);
        const accessToken = Array.isArray(parsed) ? parsed[0] : parsed.access_token || parsed;
        if (typeof accessToken === "string") {
          const payload = parseJwtPayload(accessToken);
          if (payload && payload.sub && payload.exp && payload.exp > Date.now() / 1000) {
            return {
              id: payload.sub,
              email: payload.email ?? "",
              name:
                (payload.user_metadata?.full_name as string) ??
                (payload.user_metadata?.name as string) ??
                null,
              avatarUrl: (payload.user_metadata?.avatar_url as string) ?? null,
              provider: payload.app_metadata?.provider ?? "email",
            };
          }
        }
      } catch {}
    }

    // 3. Fallback: Full network call to Supabase Auth
    const sb = await getSupabaseServer();
    const {
      data: { user },
      error,
    } = await sb.auth.getUser();

    if (error || !user?.id) return null;

    const email = user.email ?? user.identities?.[0]?.identity_data?.email ?? "";
    const name =
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null;
    const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null;
    const provider = user.app_metadata?.provider ?? "email";

    return {
      id: user.id,
      email,
      name,
      avatarUrl,
      provider,
    };
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE" || err?.message?.includes("Dynamic server usage")) {
      throw err;
    }
    return null;
  }
});

export async function requireUser(): Promise<AuthedUser> {
  const user = await getCurrentUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return user as AuthedUser;
}
