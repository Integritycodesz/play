import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import "@/app/globals.css";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Toaster } from "@/components/ui/toaster";
import { GlobalBroadcast } from "@/components/shared/global-broadcast";

// ... existing code ...

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PUBG Mobile Pro League",
  description: "The ultimate esports tournament platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${syne.variable} bg-background font-sans text-foreground antialiased selection:bg-neon-yellow/30`}
      >
        <GlobalBroadcast />
        <Navbar />
        <main className="min-h-screen pt-0">
          {children}
        </main>
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
