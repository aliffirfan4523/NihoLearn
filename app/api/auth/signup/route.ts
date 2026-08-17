import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      name,
      knowsKana,
      dailyVocabGoal,
      dailyGrammarGoal,
      japaneseLevel,
      profileCompleted,
    } = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
      knowsKana?: boolean;
      dailyVocabGoal?: number;
      dailyGrammarGoal?: number;
      japaneseLevel?: string;
      profileCompleted?: boolean;
    };

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name ?? "",
          knows_kana: knowsKana ?? false,
          daily_vocab_goal: dailyVocabGoal ?? 5,
          daily_grammar_goal: dailyGrammarGoal ?? 2,
          japanese_level: japaneseLevel ?? "Complete Beginner",
          profile_completed: profileCompleted ?? false,
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If no session returned, email confirmation is enabled.
    // Tell the frontend to show a "check your email" message instead of redirecting.
    if (!data.session) {
      return NextResponse.json({
        ok: true,
        needsConfirmation: true,
        message: "Account created! Check your email for a confirmation link before signing in.",
      });
    }

    return response;
  } catch {
    return NextResponse.json({ error: "Signup failed." }, { status: 500 });
  }
}
