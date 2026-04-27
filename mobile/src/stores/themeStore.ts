import { create } from 'zustand'

export type ThemeName = 'obsidian' | 'midnight' | 'forest' | 'crimson'

export interface ThemeColors {
  primary: string
  background: string
  cardBg: string
  text: string
  muted: string
}

const THEMES: Record<ThemeName, ThemeColors> = {
  obsidian: {
    primary: '#8B5CF6',
    background: '#05070D',
    cardBg: 'rgba(139,92,246,0.10)',
    text: '#EEF2FF',
    muted: 'rgba(238,242,255,0.45)',
  },
  midnight: {
    primary: '#7C5CFF',
    background: '#05070D',
    cardBg: 'rgba(124,92,255,0.10)',
    text: '#EEF2FF',
    muted: 'rgba(238,242,255,0.45)',
  },
  forest: {
    primary: '#34D399',
    background: '#050A08',
    cardBg: 'rgba(52,211,153,0.10)',
    text: '#EEF8F4',
    muted: 'rgba(238,248,244,0.45)',
  },
  crimson: {
    primary: '#FB7185',
    background: '#0C0507',
    cardBg: 'rgba(251,113,133,0.10)',
    text: '#FFF1F4',
    muted: 'rgba(255,241,244,0.45)',
  },
}

interface ThemeState {
  currentTheme: ThemeName
  setTheme: (theme: ThemeName) => void
  colors: ThemeColors
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: 'obsidian',
  colors: THEMES['obsidian'],
  setTheme: (theme: ThemeName) => set({ currentTheme: theme, colors: THEMES[theme] }),
}))
