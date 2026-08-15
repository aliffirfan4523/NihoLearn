import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side Supabase client that reads/writes cookies via @supabase/ssr.
// This properly handles token refresh and cookie management.
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
          // Safe to ignore if middleware refreshes the session.
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

export async function getCurrentUser(): Promise<AuthedUser | null> {
  try {
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

    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: { email, name, avatarUrl, provider },
      create: { id: user.id, email, name, avatarUrl, provider },
    });

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatarUrl: dbUser.avatarUrl,
      provider: dbUser.provider,
    };
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE" || err?.message?.includes("Dynamic server usage")) {
      throw err;
    }
    return null;
  }
}

export async function requireUser(): Promise<AuthedUser> {
  const user = await getCurrentUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return user as AuthedUser;
}
