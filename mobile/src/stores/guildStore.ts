import { create } from 'zustand'
import { guildAPI, guildRaidAPI } from '../services/api'
import type { Guild, CreateGuildDto, JoinGuildDto, GuildRaid, StartRaidDto } from '../types'
import { useAppStore } from './appStore'

interface GuildState {
  currentGuild: Guild | null
  searchResults: Guild[]
  activeRaid: GuildRaid | null
  isLoading: boolean
  raidLoading: boolean
  error: string

  fetchMyGuild: () => Promise<void>
  searchGuilds: (query?: string) => Promise<void>
  createGuild: (data: CreateGuildDto) => Promise<void>
  joinGuild: (guildId: number, data?: JoinGuildDto) => Promise<void>
  leaveGuild: () => Promise<void>
  fetchActiveRaid: () => Promise<void>
  startRaid: (data: StartRaidDto) => Promise<void>
}

export const useGuildStore = create<GuildState>((set, get) => ({
  currentGuild: null,
  searchResults: [],
  activeRaid: null,
  isLoading: false,
  raidLoading: false,
  error: '',

  fetchMyGuild: async () => {
    set({ isLoading: true, error: '' })
    try {
      const guild = await guildAPI.getMyGuild()
      set({ currentGuild: guild })
    } catch (err: any) {
      if (err?.response?.status === 404) {
        set({ currentGuild: null })
      } else {
        set({ error: 'Failed to fetch guild info.' })
      }
    } finally {
      set({ isLoading: false })
    }
  },

  searchGuilds: async (query = '') => {
    set({ isLoading: true, error: '' })
    try {
      const guilds = await guildAPI.search(query)
      set({ searchResults: guilds })
    } catch {
      set({ error: 'Failed to search guilds.' })
    } finally {
      set({ isLoading: false })
    }
  },

  createGuild: async (data: CreateGuildDto) => {
    set({ isLoading: true, error: '' })
    try {
      const guild = await guildAPI.create(data)
      set({ currentGuild: guild })
      await useAppStore.getState().hydrateDashboard()
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to create guild.' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  joinGuild: async (guildId: number, data?: JoinGuildDto) => {
    set({ isLoading: true, error: '' })
    try {
      await guildAPI.join(guildId, data)
      await get().fetchMyGuild()
      await useAppStore.getState().hydrateDashboard()
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to join guild.' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  leaveGuild: async () => {
    set({ isLoading: true, error: '' })
    try {
      await guildAPI.leave()
      set({ currentGuild: null, activeRaid: null })
      await useAppStore.getState().hydrateDashboard()
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to leave guild.' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  fetchActiveRaid: async () => {
    const guild = get().currentGuild
    if (!guild) return
    set({ raidLoading: true })
    try {
      const raid = await guildRaidAPI.getActive(guild.id)
      set({ activeRaid: raid })
    } catch (err: any) {
      if (err?.response?.status === 404) {
        set({ activeRaid: null })
      }
    } finally {
      set({ raidLoading: false })
    }
  },

  startRaid: async (data: StartRaidDto) => {
    set({ raidLoading: true, error: '' })
    try {
      const raid = await guildRaidAPI.start(data)
      set({ activeRaid: raid })
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to start raid.' })
      throw err
    } finally {
      set({ raidLoading: false })
    }
  },
}))
