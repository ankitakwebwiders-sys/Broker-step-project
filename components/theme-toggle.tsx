'use client'

import { useTheme } from './theme-provider'
import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
  variant?: 'button' | 'pill'
}

export function ThemeToggle({ className = '', showLabel = false, variant = 'button' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
          isDark
            ? 'bg-slate-800 text-amber-400 hover:bg-slate-700 border border-slate-700'
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-xs'
        } ${className}`}
      >
        {isDark ? (
          <>
            <Sun className="size-3.5 text-amber-400" />
            <span>Light</span>
          </>
        ) : (
          <>
            <Moon className="size-3.5 text-slate-600" />
            <span>Dark</span>
          </>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`inline-flex size-9 items-center justify-center rounded-xl transition-all cursor-pointer ${
        isDark
          ? 'bg-slate-800 text-amber-400 hover:bg-slate-700 hover:text-amber-300 border border-slate-700 shadow-xs'
          : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 shadow-xs'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="size-4.5 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="size-4.5 text-slate-600 transition-transform duration-200 hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="ml-2 font-medium text-xs">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  )
}
