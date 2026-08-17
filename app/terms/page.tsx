import Link from "next/link";

export const metadata = {
  title: "Terms of Service | NihoLearn",
  description: "Terms of service for utilizing the NihoLearn Japanese language study platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#1A1A1A]">
        <div className="mb-8 border-b border-black/5 pb-6 dark:border-white/5">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            Please read these terms carefully before using NihoLearn. Last updated: 8/17/2026
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-[#4A4A4A] dark:text-[#D0D0D0]">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              1. Terms
            </h2>
            <p>
              By accessing the website at https://niholearn.com (or any local or official subdomain
              of this service), you agree to be bound by these terms of service, all applicable laws
              and regulations, and agree that you are responsible for compliance with any applicable local laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              2. User Accounts
            </h2>
            <p>
              When you create an account with us, you must provide accurate, complete, and current information.
              Failure to do so constitutes a breach of the Terms, which may result in immediate termination
              of your account. You are responsible for safeguarding your password and credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              3. Content and Conduct
            </h2>
            <p>
              Our Service allows you to learn Japanese through interactive progress tracking, practice drills,
              mock exams, and vocabulary/kanji/grammar sheets. You agree not to distribute, copy, or scrape
              any learning resources, data tables, or proprietary modules without authorization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              4. Disclaimer and Learning Outcomes
            </h2>
            <p>
              NihoLearn is a self-study platform that provides tools and resources for learning Japanese.
              However, we make no guarantees or warranties regarding the effectiveness of our learning methods,
              the rate of your progress, or your success in passing official JLPT certification exams.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              5. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of France (or the jurisdiction
              governing the service operations), without regard to its conflict of law provisions.
            </p>
          </section>
        </div>

        <div className="mt-8 border-t border-black/5 pt-6 dark:border-white/5 flex justify-between">
          <Link href="/login" className="text-xs font-semibold text-[#C84B31] hover:underline dark:text-[#E85C40]">
            Back to login
          </Link>
          <Link href="/signup" className="text-xs font-semibold text-[#C84B31] hover:underline dark:text-[#E85C40]">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}