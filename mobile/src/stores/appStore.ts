import { create } from 'zustand'
import { setAuthToken, authAPI, profileAPI, analyticsAPI, taskAPI, gateAPI } from '../services/api'
import { storage } from '../utils/storage'
import { notificationService } from '../services/notifications'
import type { AuthResponse, UserProfile, DashboardStats, Task, LoginDto, Gate } from '../types'

interface AppState {
  booting: boolean
  authLoading: boolean
  dashboardLoading: boolean
  auth: AuthResponse | null
  profile: UserProfile | null
  stats: DashboardStats | null
  tasks: Task[]
  gate: Gate | null
  gateLoading: boolean
  error: string

  init: () => Promise<void>
  login: (data: LoginDto) => Promise<void>
  logout: () => Promise<void>
  hydrateDashboard: () => Promise<void>
  completeTask: (taskId: number) => Promise<void>
  createTask: (title: string) => Promise<void>
  fetchGate: () => Promise<void>
  scanAnomaly: () => Promise<void>
  setError: (error: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  booting: true,
  authLoading: false,
  dashboardLoading: false,
  auth: null,
  profile: null,
  stats: null,
  tasks: [],
  gate: null,
  gateLoading: false,
  error: '',

  init: async () => {
    try {
      const storedAuth = await storage.getAuth()
      if (storedAuth) {
        setAuthToken(storedAuth.token)
        set({ auth: storedAuth })
        await get().hydrateDashboard()
      }
    } catch {
      await storage.clearAuth()
      setAuthToken(null)
    } finally {
      set({ booting: false })
    }
  },

  login: async (data: LoginDto) => {
    set({ authLoading: true, error: '' })
    try {
      const nextAuth = await authAPI.login(data)
      setAuthToken(nextAuth.token)
      await storage.saveAuth(nextAuth)
      set({ auth: nextAuth })
      await get().hydrateDashboard()
    } catch (loginError: any) {
      set({ error: loginError?.response?.data?.message || 'Login failed. Check your credentials.' })
      throw loginError
    } finally {
      set({ authLoading: false })
    }
  },

  logout: async () => {
    await storage.clearAuth()
    setAuthToken(null)
    set({ auth: null, profile: null, stats: null, tasks: [], error: '' })
  },

  hydrateDashboard: async () => {
    set({ dashboardLoading: true })
    try {
      const [nextProfile, nextStats, nextTasks] = await Promise.all([
        profileAPI.get(),
        analyticsAPI.getDashboardStats(),
        taskAPI.getAll(),
      ])
      set({ profile: nextProfile, stats: nextStats, tasks: nextTasks, error: '' })
    } catch (loadError: any) {
      if (loadError?.response?.status === 401) {
        await get().logout()
      } else {
        set({ error: 'Unable to sync the mobile command center right now.' })
      }
    } finally {
      set({ dashboardLoading: false })
    }
  },

  completeTask: async (taskId: number) => {
    try {
      await taskAPI.complete(taskId)
      await get().hydrateDashboard()
    } catch {
      set({ error: 'Task completion did not sync. Try again.' })
    }
  },

  createTask: async (title: string) => {
    try {
      await taskAPI.create({
        title,
        category: 3,
        difficulty: 1,
        recurrence: 0,
      })
      await get().hydrateDashboard()
    } catch {
      set({ error: 'Task creation failed.' })
    }
  },

  fetchGate: async () => {
    set({ gateLoading: true })
    try {
      const gates = await gateAPI.getActive()
      const activeGate = gates.length > 0 ? gates[0] : null
      set({ gate: activeGate, error: '' })
      // Schedule expiry notification
      if (activeGate?.expiresAt) {
        notificationService.scheduleGateExpiry(activeGate.name, activeGate.expiresAt)
      }
    } catch {
      set({ error: 'Failed to fetch the active gate.' })
    } finally {
      set({ gateLoading: false })
    }
  },

  scanAnomaly: async () => {
    set({ gateLoading: true })
    try {
      const newGate = await gateAPI.generateProcedural()
      set({ gate: newGate, error: '' })
      // Schedule expiry notification for new gate
      if (newGate?.expiresAt) {
        notificationService.scheduleGateExpiry(newGate.name, newGate.expiresAt)
      }
    } catch {
      set({ error: 'Failed to scan for an anomaly. The procedural engine might be offline.' })
    } finally {
      set({ gateLoading: false })
    }
  },

  setError: (error: string) => set({ error }),
}))
