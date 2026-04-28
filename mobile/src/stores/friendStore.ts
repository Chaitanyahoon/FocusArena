import { create } from 'zustand'
import { friendAPI } from '../services/api'
import type { FriendEntry } from '../types'

interface FriendState {
  friends: FriendEntry[]
  requests: FriendEntry[]
  isLoading: boolean
  error: string

  fetchFriends: () => Promise<void>
  fetchRequests: () => Promise<void>
  sendRequest: (targetUserId: number) => Promise<void>
  respond: (requestId: number, accept: boolean) => Promise<void>
  removeFriend: (friendshipId: number) => Promise<void>
}

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  requests: [],
  isLoading: false,
  error: '',

  fetchFriends: async () => {
    set({ isLoading: true, error: '' })
    try {
      const friends = await friendAPI.getFriends()
      set({ friends })
    } catch {
      set({ error: 'Failed to load friends.' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchRequests: async () => {
    set({ isLoading: true, error: '' })
    try {
      const requests = await friendAPI.getRequests()
      set({ requests })
    } catch {
      set({ error: 'Failed to load friend requests.' })
    } finally {
      set({ isLoading: false })
    }
  },

  sendRequest: async (targetUserId: number) => {
    set({ error: '' })
    try {
      await friendAPI.sendRequest(targetUserId)
      await get().fetchRequests()
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to send friend request.' })
      throw err
    }
  },

  respond: async (requestId: number, accept: boolean) => {
    set({ error: '' })
    try {
      await friendAPI.respond(requestId, accept)
      await Promise.all([get().fetchFriends(), get().fetchRequests()])
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to respond.' })
    }
  },

  removeFriend: async (friendshipId: number) => {
    set({ error: '' })
    try {
      await friendAPI.remove(friendshipId)
      set(state => ({ friends: state.friends.filter(f => f.id !== friendshipId) }))
    } catch {
      set({ error: 'Failed to remove friend.' })
    }
  },
}))
