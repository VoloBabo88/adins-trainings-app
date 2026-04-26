import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export const ACCENT_OPTIONS = [
  { name: 'Lila',   value: '#7c3aed', light: '#8b5cf6' },
  { name: 'Grün',   value: '#22c55e', light: '#4ade80' },
  { name: 'Blau',   value: '#3b82f6', light: '#60a5fa' },
  { name: 'Rot',    value: '#ef4444', light: '#f87171' },
  { name: 'Orange', value: '#f97316', light: '#fb923c' },
]

interface ThemeCtx {
  accent: string
  setAccent: (color: string) => void
}

const ThemeContext = createContext<ThemeCtx>({ accent: '#7c3aed', setAccent: () => {} })

function applyAccent(color: string) {
  const opt = ACCENT_OPTIONS.find(o => o.value === color)
  document.documentElement.style.setProperty('--accent', color)
  document.documentElement.style.setProperty('--accent-light', opt?.light ?? color)
}

export function ThemeProvider({ children, initialAccent }: { children: ReactNode; initialAccent?: string | null }) {
  const [accent, setAccentState] = useState(initialAccent || '#7c3aed')

  const setAccent = (color: string) => {
    setAccentState(color)
    applyAccent(color)
  }

  useEffect(() => { applyAccent(accent) }, [accent])

  return <ThemeContext.Provider value={{ accent, setAccent }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
