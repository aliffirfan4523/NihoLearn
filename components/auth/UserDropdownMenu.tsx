"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Settings,
  AlertCircle,
  Mail,
  HelpCircle,
  Globe,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface UserDropdownMenuProps {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export function UserDropdownMenu({ user }: UserDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-0.5 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#C84B31]"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-xs font-bold text-white shadow-sm ring-2 ring-purple-500/40">
          {initials}
        </div>
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-black/10 bg-white p-2 shadow-2xl backdrop-blur-md dark:border-white/15 dark:bg-[#1A1A1A] z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* User Info Header */}
          <div className="border-b border-black/5 px-3 py-2.5 dark:border-white/10">
            <p className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA] truncate">
              {user.name ?? "Learner"}
            </p>
            <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0] truncate">{user.email}</p>
          </div>

          {/* Links */}
          <div className="py-1 space-y-0.5">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#1A1A1A] transition hover:bg-black/5 dark:text-[#FAFAFA] dark:hover:bg-white/5"
            >
              <User size={15} className="text-gray-400" />
              <span>Profile</span>
            </Link>

            <Link
              href="/profile/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#1A1A1A] transition hover:bg-black/5 dark:text-[#FAFAFA] dark:hover:bg-white/5"
            >
              <Settings size={15} className="text-gray-400" />
              <span>Settings</span>
            </Link>

            <Link
              href="/practice"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#1A1A1A] transition hover:bg-black/5 dark:text-[#FAFAFA] dark:hover:bg-white/5"
            >
              <HelpCircle size={15} className="text-gray-400" />
              <span>App Walkthrough</span>
            </Link>

            <a
              href="mailto:support@niholearn.com?subject=Issue%20Report"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#1A1A1A] transition hover:bg-black/5 dark:text-[#FAFAFA] dark:hover:bg-white/5"
            >
              <AlertCircle size={15} className="text-gray-400" />
              <span>Report Issue</span>
            </a>

            <a
              href="mailto:contact@niholearn.com"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#1A1A1A] transition hover:bg-black/5 dark:text-[#FAFAFA] dark:hover:bg-white/5"
            >
              <Mail size={15} className="text-gray-400" />
              <span>Contact</span>
            </a>
          </div>

          {/* Language Setting */}
          <div className="border-t border-black/5 px-3 py-2.5 dark:border-white/10">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <Globe size={14} />
                <span>GB English</span>
              </div>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                Beta
              </span>
            </div>
            <p className="mt-1 text-[10px] text-gray-400">Powered by Google Translate</p>
          </div>

          {/* Logout Action */}
          <div className="border-t border-black/5 pt-1 dark:border-white/10">
            <button
              type="button"
              onClick={async () => {
                setIsOpen(false);
                try {
                  await fetch("/api/auth/logout", { method: "POST" });
                } finally {
                  window.location.href = "/login";
                }
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-400"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
