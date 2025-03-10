import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "/public/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sudoku Minesweeper",
  description: "A unique blend of Sudoku and Minesweeper",
  manifest: "/manifest.json",
  icons: {
    icon: '/icons/icon-vignette.png',
    apple: '/icons/icon-vignette.png',
    shortcut: '/icons/icon-vignette.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sudoku Minesweeper"
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
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
      <link rel="icon" href="/icons/icon-vignette.png" sizes="any" />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
