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
import { API_HEALTH_URL } from '../config'
import { useAppStore } from '../stores/appStore'

export default function DashboardScreen() {
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

  // Mock calculation for HP/XP bars based on data
  const hpPercentage = 100 // Full HP by default unless tasks missed
  const xpPercentage = Math.min((profile?.xp || 0) % 1000 / 10, 100)

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={dashboardLoading} onRefresh={hydrateDashboard} tintColor="#3b82f6" />}
      >
        <View style={styles.header}>
          <Text style={styles.logoText}>FOCUS<Text style={{color: '#3b82f6'}}>ARENA</Text></Text>
          <View style={[styles.healthDot, serverState === 'slow' ? styles.healthDotSlow : styles.healthDotReady]} />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.identityRow}>
            <View style={styles.identitySeal}>
              <Ionicons name="flash" size={24} color="#060913" />
            </View>
            <View style={styles.identityCopy}>
              <Text style={styles.identityName}>{profile?.name || auth?.name || 'Hunter'}</Text>
              <Text style={styles.identityLevel}>LEVEL {profile?.level || auth?.level || 1} HUNTER</Text>
            </View>
          </View>

          {/* Progress Bars */}
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
                <View style={[styles.progressBarFill, { width: `${xpPercentage}%`, backgroundColor: '#3b82f6' }]} />
              </View>
              <Text style={styles.progressValue}>{profile?.xp || auth?.xp || 0}</Text>
            </View>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelLabel}>CURRENT GATE OBJECTIVE</Text>
          <Text style={styles.panelTitle}>{nextTask ? nextTask.title : 'No Active Gates.'}</Text>
          <Text style={styles.panelBody}>
            {nextTask
              ? 'Clear this objective to gain experience and close the gate.'
              : 'The dungeon is quiet. Tap the + button to open a new gate.'}
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statTile}>
              <Text style={styles.statLabel}>Open Tasks</Text>
              <Text style={styles.statValue}>{activeTasks.length}</Text>
            </View>
            <View style={styles.statTile}>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={styles.statValue}>{stats?.completedTasks || 0}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button for adding tasks */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
          // Navigation logic or modal trigger to add task
        }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#060913',
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
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    fontFamily: 'System',
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  identitySeal: {
    height: 50,
    width: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
  },
  identityCopy: {
    flex: 1,
  },
  identityName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  identityLevel: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
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
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: 'bold',
    width: 20,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressValue: {
    color: '#fff',
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
  healthDotReady: { backgroundColor: '#34D399' },
  healthDotSlow: { backgroundColor: '#F59E0B' },
  panel: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    gap: 12,
  },
  panelLabel: {
    color: '#3b82f6',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  panelTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  panelBody: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  statTile: {
    flex: 1,
    borderRadius: 12,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 5,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  fab: {
    position: 'absolute',
    bottom: 90, // Above the 65px tab bar
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
})
