import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TickerBar from "@/components/ticker-bar";
import LeftNav from "@/components/left-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Command Center",
  description: "OpenClaw Command Center Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        {/* Status Ticker Bar — full width, 36px, pinned to top */}
        <TickerBar />

        {/* Middle row: left nav + main content */}
        <div className="flex flex-1 min-h-0">
          <LeftNav />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 px-4 py-1.5 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 font-mono">
            OpenClaw Command Center
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {new Date().toLocaleDateString()}
          </span>
        </footer>
      </body>
    </html>
  );
}
