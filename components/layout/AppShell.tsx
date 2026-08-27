"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BottomNavbar } from "@/components/layout/BottomNavbar";
import { UserMenuWithDarkToggle } from "@/components/layout/UserMenuWithDarkToggle";

import { useEffect } from "react";

export function AppShell({
  children,
  userMenu,
}: {
  children: React.ReactNode;
  userMenu?: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");

  useEffect(() => {
    const offset = new Date().getTimezoneOffset();
    document.cookie = `x-timezone-offset=${offset}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] dark:bg-[#0E1117] dark:text-[#F0F4F8]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] dark:bg-[#0E1117] dark:text-[#F0F4F8]">
      <Header userMenu={<UserMenuWithDarkToggle userMenu={userMenu} />} />
      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="border-t border-black/10 px-4 py-3 text-center text-xs text-[#6B6B6B] dark:border-white/10 dark:text-[#A0A0A0]">
        This app is still in early development. Any issues? Email{" "}
        <a href="mailto:aliffirfan4523@gmail.com" className="font-medium text-[#2D5F8A] underline underline-offset-2 hover:opacity-80 dark:text-[#60A5FA]">aliffirfan4523@gmail.com</a>
      </footer>
      <BottomNavbar />
    </div>
  );
}