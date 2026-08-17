import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { knowsKana, dailyVocabGoal, dailyGrammarGoal, japaneseLevel } =
      (await request.json()) as {
        knowsKana?: boolean;
        dailyVocabGoal?: number;
        dailyGrammarGoal?: number;
        japaneseLevel?: string;
      };

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        knowsKana: knowsKana ?? false,
        dailyVocabGoal: dailyVocabGoal ?? 5,
        dailyGrammarGoal: dailyGrammarGoal ?? 2,
        japaneseLevel: japaneseLevel ?? "Complete Beginner",
        profileCompleted: true, // mark completed
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        profileCompleted: updatedUser.profileCompleted,
      },
    });
  } catch (error: any) {
    console.error("Failed to customize user account:", error);
    return NextResponse.json({ error: "Failed to customize profile." }, { status: 500 });
  }
}
