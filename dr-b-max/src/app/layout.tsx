import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dr. B-MAX Medical Companion",
  description: "Your offline inflatable healthcare AI",
  manifest: "/manifest.json",
};

import LayoutShell from "@/components/LayoutShell";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex font-sans bg-[var(--color-medical-bg)]">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
