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
