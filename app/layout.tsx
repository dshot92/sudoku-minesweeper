import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { GameProvider } from "@/contexts/GameContext";
import { AudioProvider } from "@/contexts/AudioContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sudoku Minesweeper",
  description: "A unique blend of Sudoku and Minesweeper",
  manifest: "/manifest.json",
  icons: {
    icon: '/favicon/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sudoku Minesweeper"
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AudioProvider>
            <GameProvider>
              {children}
            </GameProvider>
          </AudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
