import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "🤖 XAgent Control Dashboard - לוח בקרה",
  description: "AI Social Media Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <Script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></Script>
        <Script src="https://cdn.jsdelivr.net/npm/chart.js"></Script>
        <Script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></Script>
      </head>
      <body className="flex h-screen bg-background font-sans">{children}</body>
    </html>
  );
}
