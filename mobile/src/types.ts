export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  name: string
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
  completedAt?: string
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

export interface Guild {
  id: number
  name: string
  description?: string
  leaderId: number
  level: number
  xp: number
  capacity: number
  createdAt: string
  isPrivate: boolean
  inviteCode?: string
  members?: GuildMember[]
}

export interface GuildMember {
  id: number
  guildId: number
  userId: number
  user?: UserProfile
  role: number // 0: Member, 1: Officer, 2: Leader
  joinedAt: string
  contributionXP: number
}

export interface CreateGuildDto {
  name: string
  description?: string
  isPrivate: boolean
  inviteCode?: string
}

export interface JoinGuildDto {
  inviteCode?: string
}

// ── Daily Quests ──────────────────────────────────────────
export interface DailyQuest {
  id: number
  title: string
  description: string
  targetCount: number
  unit: string
  difficulty: number
  currentCount: number
  isCompleted: boolean
  createdAt: string
  lastProgressAt?: string
}

export interface DailyQuestStatus {
  totalQuests: number
  completedQuests: number
  isAllCompleted: boolean
  hasPenalty: boolean
}

export interface CreateDailyQuestDto {
  title: string
  targetCount: number
  unit: string
  difficulty: number
}

// ── Shop ──────────────────────────────────────────────────
export interface ShopItem {
  id: number
  name: string
  description?: string
  price: number
  imageUrl?: string
  type: string // Consumable, Cosmetic, Passive
  effectData?: string
}

export interface InventoryItem {
  id: number
  userId: number
  shopItemId: number
  quantity: number
  acquiredDate: string
  shopItem?: ShopItem
}

// ── Friends ───────────────────────────────────────────────
export interface FriendEntry {
  id: number
  friendId: number
  name: string
  avatarUrl?: string
  level: number
  status: number // 0=Pending, 1=Accepted, 2=Declined, 3=Blocked
  isIncoming: boolean
  sentAt: string
}

// ── Guild Raids ───────────────────────────────────────────
export interface GuildRaid {
  id: number
  guildId: number
  title: string
  description?: string
  status: number // 0=Active, 1=Cleared, 2=Failed
  totalHP: number
  currentHP: number
  bossName: string
  createdAt: string
  clearedAt?: string
}

export interface StartRaidDto {
  title: string
  description?: string
  bossName?: string
  totalHP: number
}

export interface AssignRaidTaskDto {
  raidId: number
  targetUserId: number
  title: string
  description?: string
  difficulty: number
}
