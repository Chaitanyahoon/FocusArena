import { create } from 'zustand'
import { dailyQuestAPI } from '../services/api'
import type { DailyQuest, DailyQuestStatus, CreateDailyQuestDto } from '../types'

interface DailyQuestState {
  quests: DailyQuest[]
  status: DailyQuestStatus | null
  isLoading: boolean
  error: string

  fetchQuests: () => Promise<void>
  fetchStatus: () => Promise<void>
  createQuest: (data: CreateDailyQuestDto) => Promise<void>
  logProgress: (questId: number, count?: number) => Promise<void>
}

export const useDailyQuestStore = create<DailyQuestState>((set, get) => ({
  quests: [],
  status: null,
  isLoading: false,
  error: '',

  fetchQuests: async () => {
    set({ isLoading: true, error: '' })
    try {
      const [quests, status] = await Promise.all([
        dailyQuestAPI.getAll(),
        dailyQuestAPI.getStatus(),
      ])
      set({ quests, status })
    } catch {
      set({ error: 'Failed to load daily quests.' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchStatus: async () => {
    try {
      const status = await dailyQuestAPI.getStatus()
      set({ status })
    } catch {
      // silent
    }
  },

  createQuest: async (data: CreateDailyQuestDto) => {
    set({ isLoading: true, error: '' })
    try {
      await dailyQuestAPI.create(data)
      await get().fetchQuests()
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to create daily quest.' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  logProgress: async (questId: number, count = 1) => {
    try {
      await dailyQuestAPI.logProgress(questId, count)
      await get().fetchQuests()
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to log progress.' })
    }
  },
}))
