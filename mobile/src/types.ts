export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  email: string
  name: string
  userId: number
  xp: number
  level: number
  guildId?: number
  role?: string
}

export interface UserProfile {
  id: number
  name: string
  email: string
  xp: number
  level: number
  streakCount: number
  totalTasksCompleted: number
  badgesEarned: number
  gold: number
  guildId?: number
}

export interface DashboardStats {
  totalTasks: number
  completedTasks: number
  currentStreak: number
  longestStreak: number
  totalXP: number
  level: number
  badgesEarned: number
  averageDailyXP: number
}

export interface Task {
  id: number
  title: string
  category: number
  difficulty: number
  status: number
  xpReward: number
}

export interface CreateTaskDto {
  title: string
  description?: string
  category: number
  difficulty: number
  recurrence?: number
}

export interface Gate {
  id: number
  rank: number // 0=E, 1=D, 2=C, 3=B, 4=A, 5=S
  name: string
  type: number // 0=Dungeon, 1=RedGate, 2=Anomaly
  bossName: string
  status: number // 0=Active, 1=Cleared, 2=Failed
  requiredLevel: number
  recommendedPartySize: number
  expiresAt: string
}

export interface LeaderboardEntry {
  userId: number
  name: string
  avatarUrl?: string
  xp: number
  level: number
  rank: number
}

export interface ChatUser {
  id: number
  name: string
  avatarUrl?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
  isOnline: boolean
}

export interface PrivateMessage {
  id: number
  senderId: number
  senderName: string
  senderAvatarUrl?: string
  receiverId: number
  content: string
  sentAt: string
  isRead: boolean
  isMe: boolean
}
