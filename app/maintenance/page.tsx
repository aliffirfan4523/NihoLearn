import { Wrench, Mail } from "lucide-react";

export const metadata = {
  title: "Maintenance | NihoLearn",
  description: "NihoLearn is undergoing maintenance. Please check back soon.",
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF8] px-6 text-center dark:bg-[#0E1117]">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#C84B31]/10 text-[#C84B31] dark:bg-[#E85C40]/10 dark:text-[#E85C40]">
        <Wrench size={40} className="animate-pulse" />
      </div>

      <p className="mt-6 text-sm font-bold uppercase tracking-widest text-[#C84B31] dark:text-[#E85C40]">
        工事中
      </p>
      <h1 className="mt-2 text-3xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
        We&apos;ll be right back!
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[#6B6B6B] dark:text-[#A0A0A0]">
        NihoLearn is undergoing scheduled maintenance. Your progress is safe.
        Please check back in a little while — ちょっと待ってください 🙏
      </p>

      <div className="mt-8 flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-xs text-[#6B6B6B] dark:border-white/10 dark:bg-[#1A1A1A] dark:text-[#A0A0A0]">
        <Mail size={14} />
        <span>
          Urgent issue?{" "}
          <a
            href="mailto:aliffirfan4523@gmail.com"
            className="font-medium underline"
          >
            aliffirfan4523@gmail.com
          </a>
        </span>
      </div>
    </div>
  );
}
