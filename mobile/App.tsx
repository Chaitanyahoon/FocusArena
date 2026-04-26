import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { API_HEALTH_URL } from './src/config'
import { analyticsAPI, authAPI, profileAPI, setAuthToken, taskAPI } from './src/services/api'
import type { AuthResponse, DashboardStats, Task, UserProfile } from './src/types'

const TOKEN_KEY = 'focusarena.mobile.token'
const AUTH_KEY = 'focusarena.mobile.auth'

function getTaskCategoryLabel(category: number) {
  switch (category) {
    case 0:
      return 'Study'
    case 1:
      return 'Work'
    case 2:
      return 'Fitness'
    case 3:
      return 'Personal'
    case 4:
      return 'Learning'
    case 5:
      return 'Note'
    default:
      return 'Quest'
  }
}

function getTaskDifficultyTone(difficulty: number) {
  switch (difficulty) {
    case 0:
      return styles.taskToneLow
    case 2:
      return styles.taskToneHigh
    default:
      return styles.taskToneMid
  }
}

export default function App() {
  const [booting, setBooting] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [serverState, setServerState] = useState<'checking' | 'ready' | 'slow'>('checking')
  const [auth, setAuth] = useState<AuthResponse | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      await Promise.all([restoreSession(), pingHealth()])
      setBooting(false)
    }
    init()
  }, [])

  const pingHealth = async () => {
    setServerState('checking')
    const timeoutId = setTimeout(() => setServerState('slow'), 5000)

    try {
      await fetch(API_HEALTH_URL)
      clearTimeout(timeoutId)
      setServerState('ready')
    } catch {
      clearTimeout(timeoutId)
      setServerState('slow')
    }
  }

  const restoreSession = async () => {
    try {
      const [storedToken, storedAuth] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(AUTH_KEY),
      ])

      if (!storedToken || !storedAuth) {
        return
      }

      const parsedAuth = JSON.parse(storedAuth) as AuthResponse
      setAuthToken(storedToken)
      setAuth(parsedAuth)
      await hydrateDashboard()
    } catch {
      await clearSession()
    }
  }

  const persistSession = async (nextAuth: AuthResponse) => {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, nextAuth.token),
      AsyncStorage.setItem(AUTH_KEY, JSON.stringify(nextAuth)),
    ])
  }

  const clearSession = async () => {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(AUTH_KEY),
    ])
    setAuthToken(null)
    setAuth(null)
    setProfile(null)
    setStats(null)
    setTasks([])
  }

  const hydrateDashboard = async () => {
    setDashboardLoading(true)

    try {
      const [nextProfile, nextStats, nextTasks] = await Promise.all([
        profileAPI.get(),
        analyticsAPI.getDashboardStats(),
        taskAPI.getAll(),
      ])
      setProfile(nextProfile)
      setStats(nextStats)
      setTasks(nextTasks)
      setError('')
    } catch (loadError: any) {
      if (loadError?.response?.status === 401) {
        await clearSession()
      } else {
        setError('Unable to sync the mobile command center right now.')
      }
    } finally {
      setDashboardLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Enter both email and password.')
      return
    }

    setAuthLoading(true)
    setError('')

    try {
      const nextAuth = await authAPI.login({ email, password })
      setAuthToken(nextAuth.token)
      setAuth(nextAuth)
      await persistSession(nextAuth)
      await hydrateDashboard()
    } catch (loginError: any) {
      setError(loginError?.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    await clearSession()
    setEmail('')
    setPassword('')
    setNewTaskTitle('')
    setError('')
  }

  const handleCompleteTask = async (taskId: number) => {
    try {
      await taskAPI.complete(taskId)
      await hydrateDashboard()
    } catch {
      setError('Task completion did not sync. Try again.')
    }
  }

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      return
    }

    try {
      await taskAPI.create({
        title: newTaskTitle.trim(),
        category: 3,
        difficulty: 1,
        recurrence: 0,
      })
      setNewTaskTitle('')
      await hydrateDashboard()
    } catch {
      setError('Task creation failed.')
    }
  }

  const activeTasks = tasks.filter((task) => task.category !== 5 && task.status !== 2)
  const nextTask = activeTasks[0]
  const completionRatio = stats && stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0

  if (booting) {
    return (
      <View style={styles.splash}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator color="#F4F7FB" size="large" />
        <Text style={styles.splashLabel}>Booting Focus Arena Mobile</Text>
      </View>
    )
  }

  return (
    <LinearGradient colors={['#060913', '#0A1020', '#060913']} style={styles.app}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {auth ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={dashboardLoading} onRefresh={hydrateDashboard} tintColor="#F4F7FB" />}
          >
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View>
                  <Text style={styles.eyebrow}>Mobile command center</Text>
                  <Text style={styles.heroTitle}>Focus Arena</Text>
                  <Text style={styles.heroSubtitle}>Daily run briefing</Text>
                </View>
                <Pressable onPress={handleLogout} style={styles.iconButton}>
                  <Ionicons name="exit-outline" size={18} color="#D7DFEA" />
                </Pressable>
              </View>

              <View style={styles.identityRow}>
                <View style={styles.identitySeal}>
                  <Ionicons name="sparkles-outline" size={20} color="#08111F" />
                </View>
                <View style={styles.identityCopy}>
                  <Text style={styles.identityName}>{profile?.name || auth.name}</Text>
                  <Text style={styles.identityMeta}>
                    Level {profile?.level || auth.level}  •  {profile?.xp || auth.xp} XP  •  Streak {profile?.streakCount || 0}
                  </Text>
                </View>
              </View>

              <View style={styles.healthRow}>
                <View style={[styles.healthDot, serverState === 'slow' ? styles.healthDotSlow : styles.healthDotReady]} />
                <Text style={styles.healthText}>
                  {serverState === 'slow' ? 'Backend is warming up.' : serverState === 'ready' ? 'Server ready.' : 'Checking backend.'}
                </Text>
              </View>
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelLabel}>Today&apos;s objective</Text>
              <Text style={styles.panelTitle}>{nextTask ? nextTask.title : 'Queue your first contract.'}</Text>
              <Text style={styles.panelBody}>
                {nextTask
                  ? 'The next task is already selected. Clear it here so the desktop and web clients stay in sync.'
                  : 'No active quests are loaded right now. Create one from mobile and keep the system moving.'}
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statTile}>
                  <Text style={styles.statLabel}>Open</Text>
                  <Text style={styles.statValue}>{activeTasks.length}</Text>
                </View>
                <View style={styles.statTile}>
                  <Text style={styles.statLabel}>Complete</Text>
                  <Text style={styles.statValue}>{stats?.completedTasks || 0}</Text>
                </View>
                <View style={styles.statTile}>
                  <Text style={styles.statLabel}>Daily rate</Text>
                  <Text style={styles.statValue}>{completionRatio}%</Text>
                </View>
              </View>
            </View>

            <View style={styles.panel}>
              <View style={styles.panelHeadingRow}>
                <Text style={styles.panelLabel}>Quick capture</Text>
                <Pressable onPress={handleCreateTask} style={styles.primaryChip}>
                  <Text style={styles.primaryChipLabel}>Save</Text>
                </Pressable>
              </View>
              <TextInput
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                placeholder="Add a task for later today"
                placeholderTextColor="rgba(231, 237, 246, 0.28)"
                style={styles.input}
              />
            </View>

            <View style={styles.panel}>
              <View style={styles.panelHeadingRow}>
                <Text style={styles.panelLabel}>Active contracts</Text>
                <Pressable onPress={hydrateDashboard} style={styles.secondaryChip}>
                  <Text style={styles.secondaryChipLabel}>Refresh</Text>
                </Pressable>
              </View>

              {activeTasks.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>No active contracts loaded.</Text>
                  <Text style={styles.emptyBody}>Use quick capture above to make mobile useful instead of passive.</Text>
                </View>
              ) : (
                activeTasks.slice(0, 6).map((task) => (
                  <View key={task.id} style={styles.taskCard}>
                    <View style={styles.taskHeader}>
                      <View style={[styles.taskTone, getTaskDifficultyTone(task.difficulty)]} />
                      <Text style={styles.taskCategory}>{getTaskCategoryLabel(task.category)}</Text>
                    </View>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <View style={styles.taskFooter}>
                      <Text style={styles.taskMeta}>{task.xpReward} XP</Text>
                      <Pressable onPress={() => handleCompleteTask(task.id)} style={styles.completeButton}>
                        <Text style={styles.completeButtonLabel}>Complete</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </ScrollView>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.loginWrapper}
          >
            <View style={styles.loginCard}>
              <Text style={styles.eyebrow}>Mobile command center</Text>
              <Text style={styles.heroTitle}>Focus Arena</Text>
              <Text style={styles.loginSubtitle}>A tighter daily cockpit for quick check-ins and fast task closure.</Text>

              <View style={styles.healthRow}>
                <View style={[styles.healthDot, serverState === 'slow' ? styles.healthDotSlow : styles.healthDotReady]} />
                <Text style={styles.healthText}>
                  {serverState === 'slow' ? 'Backend warming up.' : serverState === 'ready' ? 'Server ready.' : 'Checking backend.'}
                </Text>
              </View>

              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Email address"
                placeholderTextColor="rgba(231, 237, 246, 0.28)"
                style={styles.input}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Password"
                placeholderTextColor="rgba(231, 237, 246, 0.28)"
                style={styles.input}
              />

              {error ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable onPress={handleLogin} disabled={authLoading} style={styles.loginButton}>
                {authLoading ? (
                  <ActivityIndicator color="#08111F" />
                ) : (
                  <Text style={styles.loginButtonLabel}>Enter arena</Text>
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#060913',
    gap: 14,
  },
  splashLabel: {
    color: '#D7DFEA',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 42,
    gap: 14,
  },
  heroCard: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(231, 237, 246, 0.08)',
    backgroundColor: 'rgba(10, 14, 26, 0.82)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eyebrow: {
    color: 'rgba(231, 237, 246, 0.42)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 8,
    color: '#F4F7FB',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  heroSubtitle: {
    marginTop: 4,
    color: 'rgba(231, 237, 246, 0.42)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  iconButton: {
    height: 38,
    width: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  identityRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  identitySeal: {
    height: 46,
    width: 46,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B7F7D3',
  },
  identityCopy: {
    flex: 1,
  },
  identityName: {
    color: '#F4F7FB',
    fontSize: 18,
    fontWeight: '800',
  },
  identityMeta: {
    marginTop: 4,
    color: 'rgba(231, 237, 246, 0.48)',
    fontSize: 12,
    fontWeight: '600',
  },
  healthRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  healthDot: {
    height: 9,
    width: 9,
    borderRadius: 999,
  },
  healthDotReady: {
    backgroundColor: '#34D399',
  },
  healthDotSlow: {
    backgroundColor: '#F59E0B',
  },
  healthText: {
    color: '#D7DFEA',
    fontSize: 12,
    fontWeight: '700',
  },
  panel: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(231, 237, 246, 0.08)',
    backgroundColor: 'rgba(9, 13, 24, 0.78)',
    gap: 12,
  },
  panelHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelLabel: {
    color: 'rgba(231, 237, 246, 0.42)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  panelTitle: {
    color: '#F4F7FB',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  panelBody: {
    color: 'rgba(231, 237, 246, 0.54)',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statTile: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statLabel: {
    color: 'rgba(231, 237, 246, 0.34)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  statValue: {
    marginTop: 6,
    color: '#F4F7FB',
    fontSize: 20,
    fontWeight: '800',
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#F4F7FB',
    fontSize: 15,
    fontWeight: '600',
  },
  primaryChip: {
    borderRadius: 14,
    backgroundColor: '#F4F7FB',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  primaryChipLabel: {
    color: '#09111F',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  secondaryChip: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  secondaryChipLabel: {
    color: '#D7DFEA',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  emptyState: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    padding: 18,
    gap: 6,
  },
  emptyTitle: {
    color: '#F4F7FB',
    fontSize: 15,
    fontWeight: '800',
  },
  emptyBody: {
    color: 'rgba(231, 237, 246, 0.5)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  taskCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    gap: 10,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskTone: {
    height: 10,
    width: 10,
    borderRadius: 999,
  },
  taskToneLow: {
    backgroundColor: '#34D399',
  },
  taskToneMid: {
    backgroundColor: '#60A5FA',
  },
  taskToneHigh: {
    backgroundColor: '#FB7185',
  },
  taskCategory: {
    color: 'rgba(231, 237, 246, 0.42)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  taskTitle: {
    color: '#F4F7FB',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskMeta: {
    color: 'rgba(231, 237, 246, 0.5)',
    fontSize: 12,
    fontWeight: '700',
  },
  completeButton: {
    borderRadius: 14,
    backgroundColor: '#B7F7D3',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  completeButtonLabel: {
    color: '#08111F',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  errorBanner: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.24)',
    backgroundColor: 'rgba(127, 29, 29, 0.28)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    color: '#FECDD3',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  loginWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  loginCard: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(231, 237, 246, 0.08)',
    backgroundColor: 'rgba(10, 14, 26, 0.82)',
    padding: 22,
    gap: 14,
  },
  loginSubtitle: {
    color: 'rgba(231, 237, 246, 0.52)',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 6,
    borderRadius: 18,
    backgroundColor: '#F4F7FB',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  loginButtonLabel: {
    color: '#08111F',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
})
