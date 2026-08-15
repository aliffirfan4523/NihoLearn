"use client";

import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { useStore } from "@/lib/store";
import { useEffect } from "react";

interface UserMenuWithDarkToggleProps {
  userMenu: React.ReactNode;
}

export function UserMenuWithDarkToggle({ userMenu }: UserMenuWithDarkToggleProps) {
  // Initialize dark mode on mount
  const { darkMode } = useStore();
  
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="flex items-center gap-2">
      <DarkModeToggle />
      {userMenu}
    </div>
  );
}