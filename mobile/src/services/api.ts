import axios from 'axios'
import { API_BASE } from '../config'
import type { AuthResponse, CreateTaskDto, LoginDto, DashboardStats, Task, UserProfile } from '../types'

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
