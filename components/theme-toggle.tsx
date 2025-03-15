"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useThemeSetup } from "@/hooks/useThemeSetup"
import { MouseEventHandler } from "react"

interface ThemeToggleProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export function ThemeToggle({ onClick }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  useThemeSetup()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      toggleTheme();
    }
  }

  return (
    <Button
      size="icon"
      className="top-4 right-4"
      onClick={handleClick}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 