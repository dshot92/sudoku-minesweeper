import { useEffect } from 'react'
import { useTheme } from 'next-themes'

export function useThemeSetup() {
  const { setTheme, theme, systemTheme } = useTheme()

  useEffect(() => {
    // If no theme is set (or it's 'system'), apply the system theme
    if (!theme || theme === 'system') {
      setTheme(systemTheme || 'light')
    }
  }, [setTheme, theme, systemTheme])
} 