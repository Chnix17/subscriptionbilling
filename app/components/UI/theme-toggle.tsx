'use client'

import { useTheme } from '@/app/contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="text-xl font-bold">
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
