import { headers } from "next/headers";
import { Header } from "@/components/layout/Header";
import { BottomNavbar } from "@/components/layout/BottomNavbar";
import { UserMenu } from "@/components/auth/UserMenu";
import { UserMenuWithDarkToggle } from "@/components/layout/UserMenuWithDarkToggle";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isAuthPage) {
    return <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] dark:bg-[#0A0A0A] dark:text-[#FAFAFA]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] dark:bg-[#0A0A0A] dark:text-[#FAFAFA]">
      <Header userMenu={<UserMenuWithDarkToggle userMenu={<UserMenu />} />} />
      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-6 lg:px-8">
        {children}
      </main>
      <BottomNavbar />
    </div>
  );
}