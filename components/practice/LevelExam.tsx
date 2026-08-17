"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCcw } from "lucide-react"

import { n5Grammar } from "@/lib/data/n5-grammar"

import { readingStories } from "@/lib/data/stories"
import { HowToPlay } from "@/components/practice/HowToPlay"

type ExamLevel = "kana" | "n5" | "n4" | "n3" | "n2" | "n1"

type Question = {
  id: string
  type: string // "vocab", "kanji", "grammar", "reading", "kana"
  prompt: string
  options: string[]
  correctIndex: number
  section?: string
  metadata?: any
}

type SectionResult = {
  name: string
  score: number
  total: number
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function getRandomOptions(correct: string, pool: string[], count = 4): string[] {
  const options = new Set<string>([correct])
  const filteredPool = pool.filter(p => p !== correct)
  const shuffledPool = shuffle(filteredPool)
  
  let i = 0
  while (options.size < count && i < shuffledPool.length) {
    options.add(shuffledPool[i])
    i++
  }
  return shuffle(Array.from(options))
}

export default function LevelExam({ level = "n5" }: { level?: ExamLevel }) {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [activeSection, setActiveSection] = useState<string>("All")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const config = useMemo(() => {
    switch (level) {
      case "kana":
        return { duration: 30 * 60, title: "Kana Reading Speed & Accuracy Master Exam" }
      case "n5":
        return { duration: 60 * 60, title: "JLPT N5 Mock Exam" }
      case "n4":
      case "n3":
      case "n2":
      case "n1":
        return { duration: 90 * 60, title: `JLPT ${level.toUpperCase()} Mock Exam` }
      default:
        return { duration: 60 * 60, title: "Mock Exam" }
    }
  }, [level])

  // Generate Questions
  useEffect(() => {
    let isMounted = true

    async function initQuestions() {
      if (level === "kana") {
        // Kana questions are fetched from the database
        try {
          const kanaRes = await fetch("/api/kana")
          const kanaJson = await kanaRes.json()
          const allKana: Array<{ id: string; type: string; character: string; romaji: string; row: string }> = (kanaJson?.data ?? []).map(
            (k: any) => ({
              id: k.id as string,
              type: k.type as string,
              character: k.character as string,
              romaji: k.romaji as string,
              row: k.row as string
            })
          )

          if (allKana.length > 0) {
            const allRomaji = allKana.map(k => k.romaji)

            const selected = shuffle(allKana).slice(0, 50)
            const generated: Question[] = selected.map((k, i) => {
              const options = getRandomOptions(k.romaji, allRomaji, 4)
              return {
                id: `kana_${i}`,
                type: "kana",
                section: "Kana",
                prompt: `What is the romaji for ${k.character}?`,
                options,
                correctIndex: options.indexOf(k.romaji),
                metadata: k
              }
            })
            if (isMounted) setQuestions(generated)
          }
        } catch (kanaErr) {
          console.error("Failed to fetch exam kana:", kanaErr)
        }
      } else if (level === "n5") {
        const generated: Question[] = []
        
        // Vocab (20 questions) - fetched from PostgreSQL DB
        try {
          const vocabRes = await fetch("/api/vocab?level=N5&limit=100")
          const vocabJson = await vocabRes.json()
          const dbVocabList = vocabJson.data && vocabJson.data.length > 0 ? vocabJson.data : []

          if (dbVocabList.length > 0) {
            const vocabData = shuffle(dbVocabList).slice(0, 20)
            const allVocabMeanings = dbVocabList.map((v: any) => (Array.isArray(v.meaning) ? v.meaning[0] : String(v.meaning)))
            vocabData.forEach((v: any, i: number) => {
              const correct = Array.isArray(v.meaning) ? v.meaning[0] : String(v.meaning)
              const options = getRandomOptions(correct, allVocabMeanings, 4)
              generated.push({
                id: `vocab_${i}`,
                type: "vocab",
                section: "Vocabulary",
                prompt: `What is the meaning of ${v.word} (${v.reading})?`,
                options,
                correctIndex: options.indexOf(correct),
                metadata: v
              })
            })
          }
        } catch (vErr) {
          console.error("Failed to fetch exam vocabulary:", vErr)
        }
        
        // Kanji (15 questions) - fetched from PostgreSQL DB
        try {
          const res = await fetch("/api/kanji?level=N5")
          const json = await res.json()
          const dbKanjiList = json.data && json.data.length > 0 ? json.data : []
          
          if (dbKanjiList.length > 0) {
            const kanjiData = shuffle(dbKanjiList).slice(0, 15)
            const allKanjiReadings = dbKanjiList.flatMap((k: any) => [...(k.onyomi || []), ...(k.kunyomi || [])])
            const allKanjiMeanings = dbKanjiList.map((k: any) => k.meaning)

            kanjiData.forEach((k: any, i: number) => {
              const askMeaning = Math.random() > 0.5
              if (askMeaning) {
                const correct = k.meaning
                const options = getRandomOptions(correct, allKanjiMeanings, 4)
                generated.push({
                  id: `kanji_${i}`,
                  type: "kanji",
                  section: "Kanji",
                  prompt: `What is the meaning of the kanji ${k.character}?`,
                  options,
                  correctIndex: options.indexOf(correct),
                  metadata: k
                })
              } else {
                const readings = [...(k.onyomi || []), ...(k.kunyomi || [])]
                const correct = readings[0] || k.meaning
                const options = getRandomOptions(correct, allKanjiReadings.length > 3 ? allKanjiReadings : allKanjiMeanings, 4)
                generated.push({
                  id: `kanji_${i}`,
                  type: "kanji",
                  section: "Kanji",
                  prompt: `What is a correct reading for the kanji ${k.character}?`,
                  options,
                  correctIndex: options.indexOf(correct),
                  metadata: k
                })
              }
            })
          }
        } catch (err) {
          console.error("Failed to load kanji for exam:", err)
        }

        // Grammar (15 questions)
        const grammarData = shuffle(n5Grammar).slice(0, 15)
        const allGrammarTitles = n5Grammar.map(g => g.title)
        grammarData.forEach((g, i) => {
          const correct = g.title
          const options = getRandomOptions(correct, allGrammarTitles, 4)
          generated.push({
            id: `grammar_${i}`,
            type: "grammar",
            section: "Grammar",
            prompt: `Which grammar structure matches: "${g.meaning}"?`,
            options,
            correctIndex: options.indexOf(correct),
            metadata: g
          })
        })
        
        // Reading (5 questions) - grab from first N5 story
        const story = readingStories.find(s => s.level === "N5")
        if (story && story.questions) {
          const readingQs = story.questions.slice(0, 5)
          readingQs.forEach((q, i) => {
            generated.push({
              id: `reading_${i}`,
              type: "reading",
              section: "Reading",
              prompt: q.question,
              options: q.options,
              correctIndex: q.correctIndex,
              metadata: { storyText: story.sentences.map(s => s.fullJapanese).join(" ") }
            })
          })
        }
        
        if (isMounted) setQuestions(generated)
      }
    }

    initQuestions()

    return () => {
      isMounted = false
    }
  }, [level])

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (started && !finished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFinish()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [started, finished, timeLeft])

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      setActiveSection(questions[currentQuestionIndex].section || "")
    }
  }, [currentQuestionIndex, questions])

  const startExam = () => {
    setTimeLeft(config.duration)
    setStarted(true)
  }

  const handleSelectOption = (optIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optIndex
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      handleFinish()
    }
  }
  
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleFinish = async () => {
    setFinished(true)
    setIsSubmitting(true)
    
    // Calculate results
    let correctCount = 0
    const sectionResultsMap: Record<string, { correct: number, total: number }> = {}
    
    questions.forEach((q, i) => {
      const isCorrect = answers[i] === q.correctIndex
      if (isCorrect) correctCount++
      
      const sec = q.section || "General"
      if (!sectionResultsMap[sec]) sectionResultsMap[sec] = { correct: 0, total: 0 }
      sectionResultsMap[sec].total++
      if (isCorrect) sectionResultsMap[sec].correct++
    })
    
    const totalPercent = Math.round((correctCount / questions.length) * 100) || 0
    const passed = totalPercent >= 60
    
    const sectionResults: SectionResult[] = Object.keys(sectionResultsMap).map(key => ({
      name: key,
      score: sectionResultsMap[key].correct,
      total: sectionResultsMap[key].total
    }))
    
    const elapsedMinutes = Math.ceil((config.duration - timeLeft) / 60)

    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: level.toUpperCase(),
          durationMinutes: elapsedMinutes,
          activities: [`${level.toUpperCase()} Mock Exam`, "exam"],
          notes: JSON.stringify({ type: "exam", level, score: totalPercent, passed, sections: sectionResults }),
        }),
      })

      if (level === "kana") {
        const kanaBatch: Array<{ kanaId: string; status: "mastered" | "reviewing" }> = []
        questions.forEach((q, i) => {
          if (answers[i] !== undefined && q.metadata?.id) {
            kanaBatch.push({
              kanaId: q.metadata.id,
              status: answers[i] === q.correctIndex ? "mastered" : "reviewing",
            })
          }
        })
        if (kanaBatch.length > 0) {
          await fetch("/api/kana", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ batch: kanaBatch }),
          })
        }
      } else if (level === "n5") {
        const vocabBatch: Array<{ wordId: string; level: string; status: "mastered" | "reviewing" }> = []
        const kanjiBatch: Array<{ kanjiId: string; level: string; status: "mastered" | "reviewing" }> = []
        const grammarBatch: Array<{ grammarId: string; level: string; status: "mastered" | "reviewing" }> = []

        questions.forEach((q, i) => {
          if (answers[i] === undefined) return
          const isCorrect = answers[i] === q.correctIndex

          if (q.type === "vocab" && q.metadata?.word) {
            vocabBatch.push({
              wordId: q.metadata.word,
              level: "N5",
              status: isCorrect ? "mastered" : "reviewing",
            })
          } else if (q.type === "kanji" && q.metadata?.character) {
            kanjiBatch.push({
              kanjiId: q.metadata.character,
              level: "N5",
              status: isCorrect ? "mastered" : "reviewing",
            })
          } else if (q.type === "grammar" && q.metadata?.id) {
            grammarBatch.push({
              grammarId: q.metadata.id,
              level: "N5",
              status: isCorrect ? "mastered" : "reviewing",
            })
          }
        })

        if (vocabBatch.length > 0) {
          await fetch("/api/vocab", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ batch: vocabBatch }),
          })
        }
        if (kanjiBatch.length > 0) {
          await fetch("/api/kanji", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ batch: kanjiBatch }),
          })
        }
        if (grammarBatch.length > 0) {
          await fetch("/api/grammar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ batch: grammarBatch }),
          })
        }
      }
    } catch (error) {
      console.error("Failed to submit exam results:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Not implemented levels
  if (level !== "kana" && level !== "n5") {
    return (
      <div className="bg-white dark:bg-[#1A1A1A] border border-black/10 rounded-3xl p-8 text-center shadow-sm">
        <div className="mb-6 flex justify-center">
          <AlertCircle className="w-16 h-16 text-[#C84B31]" />
        </div>
        <h2 className="text-2xl font-bold mb-4">{config.title}</h2>
        <p className="text-muted-foreground mb-8">This exam level is coming soon! Check back later as we add more content.</p>
        <Link 
          href="/progress"
          className="inline-flex items-center gap-2 bg-[#C84B31] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#b04028] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Progress
        </Link>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // 1. Initial Start Screen
  if (!started) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link 
          href="/progress"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Progress
        </Link>
        
        <div className="bg-white dark:bg-[#1A1A1A] border border-black/10 rounded-3xl p-8 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-950/40 text-[#C84B31] rounded-full text-sm font-semibold mb-4">
            Official Simulation
          </div>
          <h1 className="text-3xl font-bold mb-4">{config.title}</h1>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Test your knowledge under real exam conditions. This exam consists of {level === 'kana' ? '50' : '55'} questions covering all required competencies for this level.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border border-black/5 bg-[#FAFAF8] dark:bg-[#2A2A2A] rounded-2xl p-4 flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#C84B31]" />
              <div>
                <div className="text-xs text-muted-foreground">Time Limit</div>
                <div className="font-bold">{Math.round(config.duration / 60)} Minutes</div>
              </div>
            </div>
            <div className="border border-black/5 bg-[#FAFAF8] dark:bg-[#2A2A2A] rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <div className="text-xs text-muted-foreground">Passing Score</div>
                <div className="font-bold">≥ 60%</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Exam Rules:</h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>The timer will start immediately once you click Start Exam.</li>
              <li>You can navigate back and forth between questions using the previous/next buttons or question grid.</li>
              <li>Your results will be automatically calculated and saved to your progress report.</li>
            </ul>
          </div>

          <div className="mt-6">
            <HowToPlay
              gameKey="level-exam"
              steps={[
                "Press Start Exam and the timer begins immediately — when it hits zero the exam submits itself.",
                "Every question is multiple choice: kana exams ask for the romaji of a character, while N5 mixes vocabulary, kanji, grammar, and reading sections.",
                "Click an option to select it, then move with Previous and Next or jump to any question in the Question Grid — answered questions turn green.",
                "The timer turns red when under five minutes remain.",
                "Press Finish Exam on the last question to see your score — 60% or higher passes, with a section-by-section breakdown saved to your progress.",
              ]}
              note="Tip: unanswered questions count as incorrect — use the Question Grid to fill in every question before you finish."
            />
          </div>

          <button
            onClick={startExam}
            className="w-full mt-8 bg-[#C84B31] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#b04028] transition-all shadow-md active:scale-[0.99]"
          >
            Start Exam
          </button>
        </div>
      </div>
    )
  }

  // 2. Results Screen
  if (finished) {
    const correctCount = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0)
    const totalPercent = Math.round((correctCount / questions.length) * 100) || 0
    const passed = totalPercent >= 60

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-[#1A1A1A] border border-black/10 rounded-3xl p-8 shadow-sm text-center">
          <div className="inline-flex p-4 rounded-full mb-4 bg-[#FAFAF8] dark:bg-[#2A2A2A]">
            {passed ? (
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            {passed ? "Congratulations! You Passed!" : "Exam Incomplete / Not Passed"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {passed 
              ? `You have demonstrated mastery of ${level.toUpperCase()} content.`
              : `You scored ${totalPercent}%. A score of 60% or higher is required to pass.`}
          </p>

          <div className="text-6xl font-black mb-8 text-[#C84B31]">
            {totalPercent}%
          </div>

          {/* Breakdown by sections */}
          <div className="border-t border-black/5 dark:border-white/5 pt-6 mb-8 text-left space-y-4">
            <h3 className="font-bold text-sm">Performance Breakdown</h3>
            {Array.from(new Set(questions.map(q => q.section))).map(secName => {
              if (!secName) return null
              const secQuestions = questions.filter(q => q.section === secName)
              const secCorrect = secQuestions.reduce((acc, q) => {
                const qIdx = questions.findIndex(item => item.id === q.id)
                return acc + (answers[qIdx] === q.correctIndex ? 1 : 0)
              }, 0)
              const percent = Math.round((secCorrect / secQuestions.length) * 100) || 0

              return (
                <div key={secName} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{secName}</span>
                    <span>{secCorrect} / {secQuestions.length} ({percent}%)</span>
                  </div>
                  <div className="h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${percent >= 60 ? 'bg-green-600' : 'bg-red-500'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setStarted(false)
                setFinished(false)
                setAnswers({})
                setCurrentQuestionIndex(0)
              }}
              className="flex-1 border border-black/10 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black/5 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" /> Retake Exam
            </button>
            <Link
              href="/progress"
              className="flex-1 bg-[#C84B31] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#b04028] transition-colors"
            >
              Back to Progress
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 3. Active Exam View
  const currentQ = questions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestionIndex]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top bar: Level Title, Active Section, Timer */}
      <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
        <div>
          <h2 className="font-bold text-lg">{config.title}</h2>
          <div className="text-xs text-muted-foreground font-semibold flex items-center gap-2">
            <span>Section: {activeSection || "All"}</span>
            <span>•</span>
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-base ${
          timeLeft < 300 ? 'bg-red-100 text-red-600 dark:bg-red-950/40 animate-pulse' : 'bg-[#FAFAF8] dark:bg-[#2A2A2A]'
        }`}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Main Layout: Question Area + Question Navigator */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Question Area */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] border border-black/10 rounded-3xl p-6 sm:p-8 shadow-sm">
            {currentQ?.metadata?.storyText && (
              <div className="mb-6 p-4 bg-[#FAFAF8] dark:bg-[#2A2A2A] rounded-2xl text-sm leading-relaxed border border-black/5">
                <div className="font-bold text-xs text-muted-foreground mb-1 uppercase tracking-wider">Reading Passage:</div>
                <div className="font-serif text-base">{currentQ.metadata.storyText}</div>
              </div>
            )}

            <h3 className="text-xl sm:text-2xl font-bold mb-6">
              {currentQ?.prompt}
            </h3>

            {/* Multiple Choice Options */}
            <div className="space-y-3">
              {currentQ?.options.map((opt, i) => {
                const isSelected = currentAnswer === i

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(i)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                      isSelected
                        ? "border-[#C84B31] bg-red-50/50 dark:bg-red-950/20 text-[#C84B31] font-semibold"
                        : "border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 bg-[#FAFAF8] dark:bg-[#2A2A2A]"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                      isSelected
                        ? "border-[#C84B31] bg-[#C84B31] text-white"
                        : "border-black/20 dark:border-white/20 text-muted-foreground"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="text-base">{opt}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 border border-black/10 rounded-xl font-semibold disabled:opacity-30 hover:bg-black/5 transition-colors"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-3 bg-[#C84B31] text-white rounded-xl font-bold hover:bg-[#b04028] transition-colors"
            >
              {currentQuestionIndex === questions.length - 1 ? "Finish Exam" : "Next Question"}
            </button>
          </div>
        </div>

        {/* Question Grid Navigator */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-black/10 rounded-3xl p-5 shadow-sm h-fit space-y-4">
          <div className="font-bold text-sm">Question Grid</div>
          
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = answers[idx] !== undefined
              const isCurrent = currentQuestionIndex === idx

              let bgClass = "bg-[#FAFAF8] dark:bg-[#2A2A2A] text-muted-foreground border-black/5"
              if (isAnswered) bgClass = "bg-green-100 dark:bg-green-950/40 text-green-700 font-bold border-green-300"
              if (isCurrent) bgClass += " ring-2 ring-[#C84B31]"

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`h-9 w-9 rounded-lg border text-xs flex items-center justify-center transition-all ${bgClass}`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <div className="border-t border-black/5 dark:border-white/5 pt-4 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#FAFAF8] dark:bg-[#2A2A2A] border border-black/5" />
              <span>Unanswered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
