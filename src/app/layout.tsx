import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import { AuthStatus } from "@/components/AuthStatus";
import "./globals.css";

// A rounded, friendly Japanese-first typeface for the whole app - matches the soft chibi
// illustration style rather than the default technical/neutral Geist font.
const roundedSans = M_PLUS_Rounded_1c({
  variable: "--font-rounded-sans",
  weight: ["400", "500", "700", "800"],
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Restaurant DNA｜飲食業界キャリア診断",
  description:
    "16の飲食シーンに答えるだけで、あなたの飲食業界での適職・強み・向いている業態がわかるエンタメ型キャリア診断。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${roundedSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <AuthStatus />
        {children}
      </body>
    </html>
  );
}
