import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface ThemeToggleProps {
  className?: string
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`glass-btn inline-flex items-center gap-2 text-sm ${className}`.trim()}
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  )
}
