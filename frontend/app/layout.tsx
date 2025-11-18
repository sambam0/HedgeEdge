import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeScript } from "./theme-script";
import { LiveAnnouncer } from "@/components/ui/live-announcer";

export const metadata: Metadata = {
  title: "Principle - Trading Terminal",
  description: "Personal trading terminal with fundamental analysis and macro dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ThemeScript />
      </head>
      <body className="font-sans">
        <Providers>
          {children}
          <LiveAnnouncer />
        </Providers>
      </body>
    </html>
  );
}
