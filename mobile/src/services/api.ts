import axios from 'axios'
import { API_BASE } from '../config'
import type { AuthResponse, CreateTaskDto, LoginDto, DashboardStats, Task, UserProfile, Gate, LeaderboardEntry, ChatUser } from '../types'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export const authAPI = {
  async login(data: LoginDto) {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  },
}

export const profileAPI = {
  async get() {
    const response = await api.get<UserProfile>('/profile')
    return response.data
  },
}

export const analyticsAPI = {
  async getDashboardStats() {
    const response = await api.get<DashboardStats>('/analytics/dashboard-stats')
    return response.data
  },
}

export const taskAPI = {
  async getAll() {
    const response = await api.get<Task[]>('/tasks')
    return response.data
  },

  async complete(id: number) {
    const response = await api.put(`/tasks/${id}/complete`)
    return response.data
  },

  async create(data: CreateTaskDto) {
    const response = await api.post<Task>('/tasks', data)
    return response.data
  },
}

export const gateAPI = {
  async getActive() {
    const response = await api.get<Gate[]>('/gates/active')
    return response.data
  },

  async generateProcedural() {
    const response = await api.post<Gate>('/gates/procedural')
    return response.data
  },
}

export const leaderboardAPI = {
  async getGlobal(limit = 100) {
    const response = await api.get<LeaderboardEntry[]>(`/leaderboard/global?limit=${limit}`)
    return response.data
  },

  async getWeekly(limit = 100) {
    const response = await api.get<LeaderboardEntry[]>(`/leaderboard/weekly?limit=${limit}`)
    return response.data
  },
}

export const chatAPI = {
  async getRecentChats() {
    const response = await api.get<ChatUser[]>('/chat/recent')
    return response.data
  },

  async searchUsers(query: string) {
    const response = await api.get<ChatUser[]>(`/chat/search?query=${query}`)
    return response.data
  },
}
