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
      <BottomNavbar />
    </div>
  );
}