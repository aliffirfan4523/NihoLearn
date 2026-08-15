"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      closeSidebar: () => set({ sidebarOpen: false }),
      darkMode: false,
      setDarkMode: (dark: boolean) => set({ darkMode: dark }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: "niholearn-storage",
    }
  )
);
