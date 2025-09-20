import type { Metadata } from "next";
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
        {/** External scripts removed: using bundled deps (socket.io-client, chart.js, lucide-react) */}
      </head>
      <body className="flex h-screen bg-background font-sans">{children}</body>
    </html>
  );
}
