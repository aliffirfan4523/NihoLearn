import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/db";

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
  knowsKana: boolean;
  dailyVocabGoal: number;
  dailyGrammarGoal: number;
  japaneseLevel: string;
  profileCompleted: boolean;
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
    // 1. Read forwarded headers from middleware
    const headerStore = await headers();
    const headerUserId = headerStore.get("x-user-id");

    if (headerUserId) {
      const email = headerStore.get("x-user-email") ?? "";
      const rawName = headerStore.get("x-user-name");
      const name = rawName ? decodeURIComponent(rawName) || null : null;
      const rawAvatar = headerStore.get("x-user-avatar");
      const avatarUrl = rawAvatar ? decodeURIComponent(rawAvatar) || null : null;
      const provider = headerStore.get("x-user-provider") ?? "email";

      // Metadata from headers
      const knowsKana = headerStore.get("x-user-knows-kana") === "true";
      const dailyVocabGoal = parseInt(headerStore.get("x-user-vocab-goal") ?? "5", 10);
      const dailyGrammarGoal = parseInt(headerStore.get("x-user-grammar-goal") ?? "2", 10);
      const rawLevel = headerStore.get("x-user-japanese-level");
      const japaneseLevel = rawLevel ? decodeURIComponent(rawLevel) : "Complete Beginner";
      const profileCompleted = headerStore.get("x-user-profile-completed") === "true";

      const user = {
        id: headerUserId,
        email,
        name,
        avatarUrl,
        provider,
      };

      try {
        const dbUser = await prisma.user.upsert({
          where: { id: user.id },
          update: {
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            provider: user.provider,
            ...(profileCompleted && {
              knowsKana,
              dailyVocabGoal,
              dailyGrammarGoal,
              japaneseLevel,
              profileCompleted: true,
            }),
          },
          create: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            provider: user.provider,
            knowsKana,
            dailyVocabGoal,
            dailyGrammarGoal,
            japaneseLevel,
            profileCompleted,
          },
        });
        return {
          ...user,
          knowsKana: dbUser.knowsKana,
          dailyVocabGoal: dbUser.dailyVocabGoal,
          dailyGrammarGoal: dbUser.dailyGrammarGoal,
          japaneseLevel: dbUser.japaneseLevel,
          profileCompleted: dbUser.profileCompleted,
        };
      } catch (error) {
        console.error("Failed to ensure user record:", error);
      }

      return {
        ...user,
        knowsKana,
        dailyVocabGoal,
        dailyGrammarGoal,
        japaneseLevel,
        profileCompleted,
      };
    }

    // 2. Parse Supabase session cookie directly
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const authCookie = allCookies.find((c) => c.name.includes("-auth-token"));

    if (authCookie && authCookie.value) {
      let rawToken = authCookie.value;
      if (rawToken.startsWith("base64-")) {
        rawToken = Buffer.from(rawToken.replace("base64-", ""), "base64").toString("utf-8");
      }
      try {
        const parsed = JSON.parse(rawToken);
        const accessToken = Array.isArray(parsed) ? parsed[0] : parsed.access_token || parsed;
        if (typeof accessToken === "string") {
          const payload = parseJwtPayload(accessToken);
          if (payload && payload.sub && payload.exp && payload.exp > Date.now() / 1000) {
            const user = {
              id: payload.sub,
              email: payload.email ?? "",
              name:
                (payload.user_metadata?.full_name as string) ??
                (payload.user_metadata?.name as string) ??
                null,
              avatarUrl: (payload.user_metadata?.avatar_url as string) ?? null,
              provider: payload.app_metadata?.provider ?? "email",
            };

            const knowsKana = payload.user_metadata?.knows_kana === true;
            const dailyVocabGoal = payload.user_metadata?.daily_vocab_goal ?? 5;
            const dailyGrammarGoal = payload.user_metadata?.daily_grammar_goal ?? 2;
            const japaneseLevel = payload.user_metadata?.japanese_level ?? "Complete Beginner";
            const profileCompleted = payload.user_metadata?.profile_completed === true;

            try {
              const dbUser = await prisma.user.upsert({
                where: { id: user.id },
                update: {
                  email: user.email,
                  name: user.name,
                  avatarUrl: user.avatarUrl,
                  provider: user.provider,
                  ...(profileCompleted && {
                    knowsKana,
                    dailyVocabGoal,
                    dailyGrammarGoal,
                    japaneseLevel,
                    profileCompleted: true,
                  }),
                },
                create: {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  avatarUrl: user.avatarUrl,
                  provider: user.provider,
                  knowsKana,
                  dailyVocabGoal,
                  dailyGrammarGoal,
                  japaneseLevel,
                  profileCompleted,
                },
              });
              return {
                ...user,
                knowsKana: dbUser.knowsKana,
                dailyVocabGoal: dbUser.dailyVocabGoal,
                dailyGrammarGoal: dbUser.dailyGrammarGoal,
                japaneseLevel: dbUser.japaneseLevel,
                profileCompleted: dbUser.profileCompleted,
              };
            } catch (error) {
              console.error("Failed to ensure user record:", error);
            }

            return {
              ...user,
              knowsKana,
              dailyVocabGoal,
              dailyGrammarGoal,
              japaneseLevel,
              profileCompleted,
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

    const knowsKana = user.user_metadata?.knows_kana === true;
    const dailyVocabGoal = user.user_metadata?.daily_vocab_goal ?? 5;
    const dailyGrammarGoal = user.user_metadata?.daily_grammar_goal ?? 2;
    const japaneseLevel = user.user_metadata?.japanese_level ?? "Complete Beginner";
    const profileCompleted = user.user_metadata?.profile_completed === true;

    const authUser = {
      id: user.id,
      email,
      name,
      avatarUrl,
      provider,
    };

    try {
      const dbUser = await prisma.user.upsert({
        where: { id: authUser.id },
        update: {
          email: authUser.email,
          name: authUser.name,
          avatarUrl: authUser.avatarUrl,
          provider: authUser.provider,
          ...(profileCompleted && {
            knowsKana,
            dailyVocabGoal,
            dailyGrammarGoal,
            japaneseLevel,
            profileCompleted: true,
          }),
        },
        create: {
          id: authUser.id,
          email: authUser.email,
          name: authUser.name,
          avatarUrl: authUser.avatarUrl,
          provider: authUser.provider,
          knowsKana,
          dailyVocabGoal,
          dailyGrammarGoal,
          japaneseLevel,
          profileCompleted,
        },
      });
      return {
        ...authUser,
        knowsKana: dbUser.knowsKana,
        dailyVocabGoal: dbUser.dailyVocabGoal,
        dailyGrammarGoal: dbUser.dailyGrammarGoal,
        japaneseLevel: dbUser.japaneseLevel,
        profileCompleted: dbUser.profileCompleted,
      };
    } catch (error) {
      console.error("Failed to ensure user record:", error);
    }

    return {
      ...authUser,
      knowsKana,
      dailyVocabGoal,
      dailyGrammarGoal,
      japaneseLevel,
      profileCompleted,
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
    throw new Error("Redirecting to login...");
  }

  // Check if profile is customized/completed
  const headersStore = await headers();
  const pathname = headersStore.get("x-pathname") || "";

  if (!user.profileCompleted && pathname !== "/profile/customize" && !pathname.startsWith("/api/")) {
    const { redirect } = await import("next/navigation");
    redirect("/profile/customize");
    throw new Error("Redirecting to profile customization...");
  }

  return user as AuthedUser;
}
