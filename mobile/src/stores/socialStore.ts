import { create } from 'zustand'
import { leaderboardAPI, chatAPI } from '../services/api'
import { signalRService } from '../services/signalr'
import { notificationService } from '../services/notifications'
import type { LeaderboardEntry, ChatUser } from '../types'

type LeaderboardTab = 'global' | 'weekly'

interface SocialState {
  leaderboard: LeaderboardEntry[]
  leaderboardTab: LeaderboardTab
  leaderboardLoading: boolean

  recentChats: ChatUser[]
  chatsLoading: boolean
  onlineUserIds: number[]

  error: string

  setLeaderboardTab: (tab: LeaderboardTab) => void
  fetchLeaderboard: () => Promise<void>
  fetchRecentChats: () => Promise<void>
  initRealtime: () => () => void // returns cleanup function
}

export const useSocialStore = create<SocialState>((set, get) => ({
  leaderboard: [],
  leaderboardTab: 'global',
  leaderboardLoading: false,

  recentChats: [],
  chatsLoading: false,
  onlineUserIds: [],

  error: '',

  setLeaderboardTab: (tab: LeaderboardTab) => {
    set({ leaderboardTab: tab })
    get().fetchLeaderboard()
  },

  fetchLeaderboard: async () => {
    set({ leaderboardLoading: true, error: '' })
    try {
      const tab = get().leaderboardTab
      const data = tab === 'global'
        ? await leaderboardAPI.getGlobal(50)
        : await leaderboardAPI.getWeekly(50)
      set({ leaderboard: data })
    } catch {
      set({ error: 'Failed to load leaderboard rankings.' })
    } finally {
      set({ leaderboardLoading: false })
    }
  },

  fetchRecentChats: async () => {
    set({ chatsLoading: true, error: '' })
    try {
      const data = await chatAPI.getRecentChats()
      set({ recentChats: data })
    } catch {
      set({ error: 'Failed to load recent messages.' })
    } finally {
      set({ chatsLoading: false })
    }
  },

  initRealtime: () => {
    // Listen for incoming private messages via SignalR
    const unsubMessage = signalRService.onMessage((message) => {
      // Trigger a local notification for new messages
      notificationService.sendLocalNotification(
        `💬 ${message.senderName}`,
        message.content,
      )
      // Refresh recent chats to update the list
      get().fetchRecentChats()
    })

    // Presence tracking
    const unsubOnline = signalRService.onUserOnline((userId) => {
      set((state) => ({
        onlineUserIds: [...new Set([...state.onlineUserIds, userId])],
      }))
    })

    const unsubOffline = signalRService.onUserOffline((userId) => {
      set((state) => ({
        onlineUserIds: state.onlineUserIds.filter((id) => id !== userId),
      }))
    })

    // Fetch initial online users
    signalRService.getOnlineUsers().then((ids) => {
      set({ onlineUserIds: ids })
    })

    // Return cleanup function
    return () => {
      unsubMessage()
      unsubOnline()
      unsubOffline()
    }
  },
}))
