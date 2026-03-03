import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'teacherflow-theme'

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyTheme = (theme: Theme) => {
  const html = document.documentElement
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme

  if (effectiveTheme === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
}

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    const initialTheme = storedTheme || 'system'
    setTheme(initialTheme)
    applyTheme(initialTheme)
    setMounted(true)
  }, [])

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme: Theme = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      applyTheme(newTheme)
      return newTheme
    })
  }

  const setLightTheme = () => {
    setTheme('light')
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    applyTheme('light')
  }

  const setDarkTheme = () => {
    setTheme('dark')
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    applyTheme('dark')
  }

  const setSystemTheme = () => {
    setTheme('system')
    localStorage.setItem(THEME_STORAGE_KEY, 'system')
    applyTheme('system')
  }

  const isDark = theme === 'dark' || (theme === 'system' && getSystemTheme() === 'dark')

  return {
    theme,
    isDark,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    mounted,
  }
}
