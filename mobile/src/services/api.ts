import axios from 'axios'
import { API_BASE } from '../config'
import type {
  AuthResponse, CreateTaskDto, LoginDto, DashboardStats, Task, UserProfile,
  Gate, LeaderboardEntry, ChatUser, DailyQuest, DailyQuestStatus,
  CreateDailyQuestDto, ShopItem, InventoryItem, FriendEntry,
  GuildRaid, StartRaidDto, AssignRaidTaskDto,
} from '../types'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
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
    return (await api.post<AuthResponse>('/auth/login', data)).data
  },
  async register(data: import('../types').RegisterDto) {
    return (await api.post<AuthResponse>('/auth/register', data)).data
  },
}

export const profileAPI = {
  async get() {
    return (await api.get<UserProfile>('/profile')).data
  },
}

export const analyticsAPI = {
  async getDashboardStats() {
    return (await api.get<DashboardStats>('/analytics/dashboard-stats')).data
  },
}

export const taskAPI = {
  async getAll() {
    return (await api.get<Task[]>('/tasks')).data
  },
  async complete(id: number) {
    return (await api.put(`/tasks/${id}/complete`)).data
  },
  async create(data: CreateTaskDto) {
    return (await api.post<Task>('/tasks', data)).data
  },
  async delete(id: number) {
    return (await api.delete(`/tasks/${id}`)).data
  },
}

export const gateAPI = {
  async getActive() {
    return (await api.get<Gate[]>('/gates/active')).data
  },
  async generateProcedural() {
    return (await api.post<Gate>('/gates/procedural')).data
  },
}

export const leaderboardAPI = {
  async getGlobal(limit = 100) {
    return (await api.get<LeaderboardEntry[]>(`/leaderboard/global?limit=${limit}`)).data
  },
  async getWeekly(limit = 100) {
    return (await api.get<LeaderboardEntry[]>(`/leaderboard/weekly?limit=${limit}`)).data
  },
}

export const chatAPI = {
  async getRecentChats() {
    return (await api.get<ChatUser[]>('/chat/recent')).data
  },
  async searchUsers(query: string) {
    return (await api.get<ChatUser[]>(`/chat/search?query=${query}`)).data
  },
}

export const guildAPI = {
  async getMyGuild() {
    return (await api.get<import('../types').Guild>('/Guilds/my')).data
  },
  async search(query: string = '') {
    return (await api.get<import('../types').Guild[]>(`/Guilds?query=${query}`)).data
  },
  async create(data: import('../types').CreateGuildDto) {
    return (await api.post<import('../types').Guild>('/Guilds', data)).data
  },
  async join(guildId: number, data?: import('../types').JoinGuildDto) {
    return (await api.post(`/Guilds/${guildId}/join`, data || {})).data
  },
  async leave() {
    return (await api.post('/Guilds/leave')).data
  },
}

// ── Daily Quests ──────────────────────────────────────────
export const dailyQuestAPI = {
  async getAll() {
    return (await api.get<DailyQuest[]>('/dailyquest')).data
  },
  async create(data: CreateDailyQuestDto) {
    return (await api.post<DailyQuest>('/dailyquest', data)).data
  },
  async logProgress(questId: number, count: number) {
    return (await api.post(`/dailyquest/${questId}/progress`, count)).data
  },
  async getStatus() {
    return (await api.get<DailyQuestStatus>('/dailyquest/status')).data
  },
}

// ── Shop ──────────────────────────────────────────────────
export const shopAPI = {
  async getItems() {
    return (await api.get<ShopItem[]>('/shop/items')).data
  },
  async getInventory() {
    return (await api.get<InventoryItem[]>('/shop/inventory')).data
  },
  async buyItem(itemId: number) {
    return (await api.post(`/shop/buy/${itemId}`)).data
  },
  async useItem(itemId: number) {
    return (await api.post(`/shop/use/${itemId}`)).data
  },
}

// ── Friends ───────────────────────────────────────────────
export const friendAPI = {
  async getFriends() {
    return (await api.get<FriendEntry[]>('/friend')).data
  },
  async getRequests() {
    return (await api.get<FriendEntry[]>('/friend/requests')).data
  },
  async sendRequest(targetUserId: number) {
    return (await api.post(`/friend/request/${targetUserId}`)).data
  },
  async respond(requestId: number, accept: boolean) {
    return (await api.post(`/friend/respond/${requestId}?accept=${accept}`)).data
  },
  async remove(friendshipId: number) {
    return (await api.delete(`/friend/${friendshipId}`)).data
  },
}

// ── Guild Raids ───────────────────────────────────────────
export const guildRaidAPI = {
  async getActive(guildId: number) {
    return (await api.get<GuildRaid>(`/guildraid/${guildId}/active`)).data
  },
  async start(data: StartRaidDto) {
    return (await api.post<GuildRaid>('/guildraid/start', data)).data
  },
  async assignTask(data: AssignRaidTaskDto) {
    return (await api.post('/guildraid/assign', data)).data
  },
}
