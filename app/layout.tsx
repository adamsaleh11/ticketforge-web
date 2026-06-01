import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/providers/query-provider";
import { SpiralHero } from "@/components/shared/spiral-hero";
import "./globals.css";

export const metadata: Metadata = {
  title: "TicketForge",
  description: "Turn project ideas into phased engineering tickets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden antialiased">
        <div className="pointer-events-none fixed inset-0 z-0 bg-black">
          <SpiralHero />
        </div>
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
