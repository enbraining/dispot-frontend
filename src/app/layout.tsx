import type { Metadata } from "next";
import localFont from "next/font/local";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const pretendard = localFont({
  src: [
    { path: "../../public/fonts/Pretendard-Regular.woff2", weight: "400" },
    { path: "../../public/fonts/Pretendard-Medium.woff2", weight: "500" },
    { path: "../../public/fonts/Pretendard-SemiBold.woff2", weight: "600" },
    { path: "../../public/fonts/Pretendard-Bold.woff2", weight: "700" },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DISPOT — 디스코드 서버 리스트",
  description: "한국 디스코드 서버를 찾고 등록하세요.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning className={`${pretendard.variable} ${spaceMono.variable}`}>
      <body
        className="bg-gray-50 dark:bg-zinc-950 min-h-screen flex flex-col text-gray-900 dark:text-white antialiased"
        style={{ fontFamily: "var(--font-pretendard), sans-serif" }}
      >
        <Header />
        <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
