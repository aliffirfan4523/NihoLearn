import { requireUser } from "@/lib/auth"
import LevelExam from "@/components/practice/LevelExam"
import { redirect } from "next/navigation"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mock Exam | NihoLearn",
  description: "Test your Japanese proficiency with a mock exam.",
}

export default async function ExamPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await requireUser()
  const resolvedParams = await searchParams
  const level = resolvedParams.level
  
  if (!level || typeof level !== "string") {
    redirect("/progress")
  }

  const validLevels = ["kana", "n5", "n4", "n3", "n2", "n1"]
  if (!validLevels.includes(level)) {
    redirect("/progress")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <LevelExam level={level as "kana" | "n5" | "n4" | "n3" | "n2" | "n1"} />
    </div>
  )
}
