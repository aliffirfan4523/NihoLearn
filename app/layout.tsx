import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { UserMenu } from "@/components/auth/UserMenu";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "NihoLearn | 日本語トラッカー",
  description: "Japanese learning progress tracker for kana and JLPT study.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansJp.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storage = localStorage.getItem('niholearn-storage');
                  if (storage) {
                    var parsed = JSON.parse(storage);
                    if (parsed && parsed.state && parsed.state.darkMode) {
                      document.documentElement.classList.add('dark');
                    }
                  }
                  var themeColor = localStorage.getItem('niholearn-theme-color');
                  if (themeColor) {
                    document.documentElement.setAttribute('data-theme-color', themeColor);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <AppShell userMenu={<UserMenu />}>{children}</AppShell>
      </body>
    </html>
  );
}
