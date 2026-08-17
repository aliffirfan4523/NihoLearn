import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | NihoLearn",
  description: "Building your Japanese island with trust and transparency.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#1A1A1A]">
        <div className="mb-8 border-b border-black/5 pb-6 dark:border-white/5">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            Building your Japanese island with trust and transparency. Last updated: 22/05/2025
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-[#4A4A4A] dark:text-[#D0D0D0]">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              Our Commitment to Your Privacy
            </h2>
            <p>
              Your journey to mastering Japanese is personal, and so is your data. At NihoLearn, we
              believe in being transparent about how we handle your information while you build your
              virtual Japanese learning environment.
            </p>
            <p>
              This policy outlines our practices for collecting, using, and protecting your data as you
              use our platform at niholearn.com. By joining our community, you're trusting us with your
              information, and we take that trust seriously.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              Essential Data We Need
            </h2>
            <p>To create your personalized Japanese learning experience, we need certain information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account Basics:</strong> Your email for account access, a secure password you
                create, and your chosen display name.
              </li>
              <li>
                <strong>Learning Data:</strong> Your study progress, learning preferences, and customization
                choices.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              How Your Data Helps Us Help You
            </h2>
            <p>Every piece of information we collect serves a specific purpose in enhancing your learning journey:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Personalized Learning Path:</strong> We track your progress to adjust difficulty
                levels and recommend appropriate study materials.
              </li>
              <li>
                <strong>Progress Tracking:</strong> Your preferences help us save and evolve your learning
                environment and stats.
              </li>
              <li>
                <strong>Service Improvements:</strong> Usage patterns help us identify areas where we can make the platform more effective.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              Keeping Your Data Safe
            </h2>
            <p>
              Security is our priority. We limit access to user data only to essential systems and
              continuously monitor for potential issues.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              Tools We Trust
            </h2>
            <p>To provide you with the best learning experience, we partner with trusted services:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Google Analytics for platform insights.</li>
              <li>PostHog for anonymous usage analytics.</li>
              <li>Prisma and Supabase for secure data storage.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              Your Privacy Choices
            </h2>
            <p>
              You're in control of your data. You can update or correct your information through your account settings
              at any time. To request data erasure, please contact us at support@niholearn.com.
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