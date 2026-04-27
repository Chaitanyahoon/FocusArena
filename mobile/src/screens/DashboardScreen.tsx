import React, { useEffect, useState } from 'react'
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { API_HEALTH_URL } from '../config'
import { useAppStore } from '../stores/appStore'
import { mobileTheme } from '../theme'

export default function DashboardScreen() {
  const navigation = useNavigation<any>()
  const { auth, profile, stats, tasks, hydrateDashboard, dashboardLoading } = useAppStore()
  const [serverState, setServerState] = useState<'checking' | 'ready' | 'slow'>('checking')

  useEffect(() => {
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
    pingHealth()
  }, [])

  const activeTasks = tasks.filter((task) => task.category !== 5 && task.status !== 2)
  const nextTask = activeTasks[0]
  const completionRatio = stats && stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0
  const hunterLevel = profile?.level || auth?.level || 1
  const hunterName = profile?.name || auth?.name || 'Hunter'
  const xpPercentage = Math.min((profile?.xp || 0) % 1000 / 10, 100)
  const currentStreak = profile?.streakCount || stats?.currentStreak || 0
  const hpPercentage = Math.max(38, 100 - Math.min(activeTasks.length * 6, 46))

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={dashboardLoading} onRefresh={hydrateDashboard} tintColor={mobileTheme.accent} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>FOCUS<Text style={{color: mobileTheme.accent}}>ARENA</Text></Text>
            <Text style={styles.headerCaption}>Hunter system</Text>
          </View>
          <View style={styles.headerStatus}>
            <View style={[styles.healthDot, serverState === 'slow' ? styles.healthDotSlow : styles.healthDotReady]} />
            <Text style={styles.headerStatusText}>{serverState === 'ready' ? 'SYNC' : 'DELAY'}</Text>
          </View>
        </View>

        <LinearGradient
          colors={['rgba(124,92,255,0.24)', 'rgba(16,21,34,0.96)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.identityRow}>
              <View style={styles.identitySeal}>
                <Ionicons name="flash" size={24} color={mobileTheme.background} />
              </View>
              <View style={styles.identityCopy}>
                <Text style={styles.identityTag}>ACTIVE HUNTER</Text>
                <Text style={styles.identityName}>{hunterName}</Text>
                <Text style={styles.identityLevel}>LEVEL {hunterLevel} SHADOW RUNNER</Text>
              </View>
            </View>
            <View style={styles.rankPlate}>
              <Text style={styles.rankPlateLabel}>RANK</Text>
              <Text style={styles.rankPlateValue}>{hunterLevel >= 25 ? 'MONARCH' : hunterLevel >= 10 ? 'A-CLASS' : 'RISING'}</Text>
            </View>
          </View>

          <View style={styles.readoutRow}>
            <View style={styles.readoutTile}>
              <Text style={styles.readoutLabel}>STREAK</Text>
              <Text style={styles.readoutValue}>{currentStreak}D</Text>
            </View>
            <View style={styles.readoutTile}>
              <Text style={styles.readoutLabel}>CLEAR RATE</Text>
              <Text style={styles.readoutValue}>{completionRatio}%</Text>
            </View>
            <View style={styles.readoutTile}>
              <Text style={styles.readoutLabel}>OPEN GATES</Text>
              <Text style={styles.readoutValue}>{activeTasks.length}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>HP</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${hpPercentage}%`, backgroundColor: '#ef4444' }]} />
              </View>
              <Text style={styles.progressValue}>{hpPercentage}%</Text>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>XP</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${xpPercentage}%`, backgroundColor: mobileTheme.accent }]} />
              </View>
              <Text style={styles.progressValue}>{profile?.xp || auth?.xp || 0}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.gridRow}>
          <View style={[styles.panel, styles.mainPanel]}>
            <Text style={styles.panelLabel}>CURRENT OBJECTIVE</Text>
            <Text style={styles.panelTitle}>{nextTask ? nextTask.title : 'No active gates detected.'}</Text>
            <Text style={styles.panelBody}>
              {nextTask
                ? 'Clear this objective now to stabilize the sector and keep the streak alive.'
                : 'The field is quiet. Issue a new quest and force the system to respond.'}
            </Text>

            <View style={styles.inlineStats}>
              <View style={styles.inlineStat}>
                <Text style={styles.inlineStatLabel}>COMPLETED</Text>
                <Text style={styles.inlineStatValue}>{stats?.completedTasks || 0}</Text>
              </View>
              <View style={styles.inlineStat}>
                <Text style={styles.inlineStatLabel}>TOTAL XP</Text>
                <Text style={styles.inlineStatValue}>{stats?.totalXP || profile?.xp || auth?.xp || 0}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.questButton}
              onPress={() => navigation.navigate('Quests')}
              accessibilityRole="button"
            >
              <Text style={styles.questButtonText}>{nextTask ? 'OPEN QUEST LOG' : 'CREATE FIRST QUEST'}</Text>
              <Ionicons name="arrow-forward" size={16} color={mobileTheme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.sideColumn}>
            <View style={styles.statTile}>
              <Text style={styles.statLabel}>STREAK PRESSURE</Text>
              <Text style={styles.statValue}>{currentStreak > 0 ? 'ONLINE' : 'IDLE'}</Text>
              <Text style={styles.statBody}>One finished task keeps the system awake for tomorrow.</Text>
            </View>
            <View style={styles.statTile}>
              <Text style={styles.statLabel}>NEXT REWARD</Text>
              <Text style={styles.statValue}>{Math.max(100 - ((profile?.xp || auth?.xp || 0) % 100), 0)} XP</Text>
              <Text style={styles.statBody}>Needed to push the next visible level threshold.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('Quests')}
        accessibilityRole="button"
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: mobileTheme.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100, // Extra padding for bottom tabs & FAB
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerCaption: {
    marginTop: 4,
    color: mobileTheme.textDim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: mobileTheme.panelSoft,
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
  },
  headerStatusText: {
    color: mobileTheme.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: mobileTheme.text,
    letterSpacing: 2,
    fontFamily: 'System',
  },
  heroCard: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: mobileTheme.border,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  identitySeal: {
    height: 56,
    width: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: mobileTheme.accent,
  },
  identityCopy: {
    flex: 1,
  },
  identityTag: {
    color: mobileTheme.textDim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  identityName: {
    color: mobileTheme.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  identityLevel: {
    color: mobileTheme.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 4,
  },
  rankPlate: {
    minWidth: 86,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
    alignItems: 'flex-end',
  },
  rankPlateLabel: {
    color: mobileTheme.textDim,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  rankPlateValue: {
    marginTop: 6,
    color: mobileTheme.text,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  readoutRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    marginBottom: 18,
  },
  readoutTile: {
    flex: 1,
    minHeight: 72,
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
  },
  readoutLabel: {
    color: mobileTheme.textDim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  readoutValue: {
    marginTop: 10,
    color: mobileTheme.text,
    fontSize: 22,
    fontWeight: '900',
  },
  progressContainer: {
    gap: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressLabel: {
    color: mobileTheme.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    width: 20,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressValue: {
    color: mobileTheme.text,
    fontSize: 12,
    fontWeight: 'bold',
    width: 35,
    textAlign: 'right',
  },
  healthDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
  },
  healthDotReady: { backgroundColor: mobileTheme.success },
  healthDotSlow: { backgroundColor: mobileTheme.warning },
  gridRow: {
    gap: 14,
  },
  panel: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
    backgroundColor: mobileTheme.backgroundElevated,
    gap: 12,
  },
  mainPanel: {
    paddingBottom: 18,
  },
  panelLabel: {
    color: mobileTheme.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  panelTitle: {
    color: mobileTheme.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  panelBody: {
    color: mobileTheme.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  inlineStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  inlineStat: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    backgroundColor: mobileTheme.blackGlass,
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
  },
  inlineStatLabel: {
    color: mobileTheme.textDim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  inlineStatValue: {
    marginTop: 8,
    color: mobileTheme.text,
    fontSize: 22,
    fontWeight: '900',
  },
  sideColumn: {
    gap: 14,
  },
  statTile: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: mobileTheme.blackGlass,
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
  },
  statLabel: {
    color: mobileTheme.textDim,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 5,
  },
  statValue: {
    color: mobileTheme.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 8,
  },
  statBody: {
    marginTop: 8,
    color: mobileTheme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  questButton: {
    marginTop: 8,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: mobileTheme.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  questButtonText: {
    color: mobileTheme.text,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  fab: {
    position: 'absolute',
    bottom: 90, // Above the 65px tab bar
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: mobileTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: mobileTheme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
})
