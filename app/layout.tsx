import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

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
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} ${syne.variable} bg-background font-sans text-foreground antialiased selection:bg-neon-yellow/30`}
      >
        <Navbar />
        <main className="min-h-screen pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
