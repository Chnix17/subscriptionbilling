'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Get theme from localStorage or system preference
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored) {
      setThemeState(stored)
    } else {
      // Check system preference
      const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setThemeState(system)
      localStorage.setItem('theme', system)
    }
    
    setMounted(true)
    
    // Try to load theme from server in background
    fetch('/api/user/theme')
      .then(response => response.json())
      .then(result => {
        if (result.success && result.data.theme && result.data.theme !== theme) {
          setThemeState(result.data.theme)
          localStorage.setItem('theme', result.data.theme)
        }
        console.log('ThemeProvider initialized with theme:', theme)
        console.log('ThemeProvider mounted:', mounted)
      })
      .catch(error => {
        console.log('Could not sync theme from server')
      })
  }, [])

  useEffect(() => {
    if (!mounted) return

    console.log('Applying theme to document:', theme)
    
    const root = document.documentElement
    const body = document.body
    
    if (theme === 'dark') {
      root.classList.add('dark')
      body.classList.add('dark')
      console.log('Added dark classes to root and body')
    } else {
      root.classList.remove('dark')
      body.classList.remove('dark')
      console.log('Removed dark classes from root and body')
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme)
    
    // Save to server if user is logged in
    saveThemePreference(theme)
  }, [theme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    console.log('toggleTheme called - current theme:', theme)
    setThemeState(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light'
      console.log('Setting theme from', prev, 'to', newTheme)
      return newTheme
    })
  }

  const saveThemePreference = async (theme: Theme) => {
    try {
      await fetch('/api/user/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      })
    } catch (error) {
      console.log('Could not save theme preference to server')
    }
  }

  // Prevent flash of incorrect theme
  if (!mounted) {
    return null
  }

  console.log('ThemeProvider rendering with theme:', theme)
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
