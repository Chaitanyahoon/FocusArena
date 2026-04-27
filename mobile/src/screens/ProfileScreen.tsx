import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppStore } from '../stores/appStore'
import { useThemeStore, ThemeName } from '../stores/themeStore'
import { mobileTheme } from '../theme'

export default function ProfileScreen() {
  const { auth, profile, stats, logout } = useAppStore()
  const { currentTheme, colors, setTheme } = useThemeStore()

  const statGrid = [
    { icon: 'flash', label: 'XP', value: (profile?.xp || auth?.xp || 0).toLocaleString(), color: colors.primary },
    { icon: 'flame', label: 'Streak', value: `${profile?.streakCount || stats?.currentStreak || 0}d`, color: '#f97316' },
    { icon: 'trophy', label: 'Badges', value: profile?.badgesEarned || stats?.badgesEarned || 0, color: '#eab308' },
    { icon: 'logo-bitcoin', label: 'Gold', value: (profile?.gold || 0).toLocaleString(), color: '#FFD700' },
    { icon: 'checkmark-done', label: 'Completed', value: profile?.totalTasksCompleted || stats?.completedTasks || 0, color: '#34D399' },
    { icon: 'calendar', label: 'Daily XP', value: stats?.averageDailyXP || 0, color: colors.primary },
  ]

  const availableThemes: { id: ThemeName; label: string }[] = [
    { id: 'obsidian', label: 'Obsidian' },
    { id: 'midnight', label: 'Midnight' },
    { id: 'forest', label: 'Forest' },
    { id: 'crimson', label: 'Crimson' },
  ]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>HUNTER PROFILE</Text>
          <Text style={styles.headerCaption}>Identity ledger</Text>
        </View>

        <LinearGradient
          colors={[`${colors.primary}33`, 'rgba(16,21,34,0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.identityCard, { borderColor: `${colors.primary}30` }]}
        >
          <View style={styles.identityTopRow}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
              <Ionicons name="person" size={36} color={colors.background} />
            </View>
            <View style={styles.identityMain}>
              <Text style={styles.identityTag}>REGISTERED HUNTER</Text>
              <Text style={[styles.hunterName, { color: colors.text }]}>{profile?.name || auth?.name || 'Unknown Hunter'}</Text>
              <Text style={[styles.emailText, { color: colors.muted }]}>{profile?.email || auth?.email || ''}</Text>
            </View>
          </View>

          <View style={styles.identityStatsRow}>
            <View style={[styles.levelBadge, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
              <Text style={[styles.levelText, { color: colors.primary }]}>LEVEL {profile?.level || auth?.level || 1}</Text>
            </View>
            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeLabel}>STATUS</Text>
              <Text style={styles.rankBadgeValue}>{(profile?.streakCount || stats?.currentStreak || 0) > 0 ? 'ASCENDING' : 'DORMANT'}</Text>
            </View>
          </View>

          <View style={styles.identityFootRow}>
            <View style={styles.identityFootTile}>
              <Text style={styles.identityFootLabel}>TASKS</Text>
              <Text style={styles.identityFootValue}>{profile?.totalTasksCompleted || stats?.completedTasks || 0}</Text>
            </View>
            <View style={styles.identityFootTile}>
              <Text style={styles.identityFootLabel}>BADGES</Text>
              <Text style={styles.identityFootValue}>{profile?.badgesEarned || stats?.badgesEarned || 0}</Text>
            </View>
            <View style={styles.identityFootTile}>
              <Text style={styles.identityFootLabel}>GOLD</Text>
              <Text style={styles.identityFootValue}>{profile?.gold || 0}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>SYSTEM READOUT</Text>
        </View>
        <View style={styles.gridContainer}>
          {statGrid.map((stat, idx) => (
            <View key={idx} style={styles.gridItem}>
              <View style={[styles.gridIconBg, { backgroundColor: `${stat.color}20` }]}>
                <Ionicons name={stat.icon as any} size={18} color={stat.color} />
              </View>
              <Text style={[styles.gridValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.gridLabel, { color: colors.muted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.themeSection}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>THEME VAULT</Text>
          <View style={styles.themeRow}>
            {availableThemes.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.themeButton,
                  currentTheme === t.id && { borderColor: colors.primary, backgroundColor: `${colors.primary}20` }
                ]}
                onPress={() => setTheme(t.id)}
              >
                <Text style={[
                  styles.themeButtonText,
                  { color: currentTheme === t.id ? colors.primary : colors.muted }
                ]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={20} color={colors.muted} />
            <Text style={[styles.actionText, { color: colors.text }]}>Settings</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
            <Ionicons name="help-circle-outline" size={20} color={colors.muted} />
            <Text style={[styles.actionText, { color: colors.text }]}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>LOGOUT SYSTEM</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>FocusArena Mobile v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mobileTheme.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    color: mobileTheme.accent,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerCaption: {
    marginTop: 4,
    color: mobileTheme.textDim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  identityCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    marginBottom: 20,
  },
  identityTopRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: mobileTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityMain: {
    flex: 1,
  },
  identityTag: {
    color: mobileTheme.textDim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.7,
    textTransform: 'uppercase',
  },
  hunterName: {
    color: mobileTheme.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  identityStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 18,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  levelText: {
    color: mobileTheme.accent,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  rankBadge: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
    alignItems: 'flex-end',
  },
  rankBadgeLabel: {
    color: mobileTheme.textDim,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  rankBadgeValue: {
    marginTop: 4,
    color: mobileTheme.text,
    fontSize: 12,
    fontWeight: '900',
  },
  emailText: {
    color: mobileTheme.textDim,
    fontSize: 12,
    marginTop: 4,
  },
  identityFootRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  identityFootTile: {
    flex: 1,
    minHeight: 74,
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
  },
  identityFootLabel: {
    color: mobileTheme.textDim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  identityFootValue: {
    marginTop: 10,
    color: mobileTheme.text,
    fontSize: 20,
    fontWeight: '900',
  },

  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  gridItem: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: mobileTheme.panelSoft,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
  },
  gridIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridValue: {
    color: mobileTheme.text,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  gridLabel: {
    color: mobileTheme.textDim,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  actionsContainer: {
    marginHorizontal: 20,
    backgroundColor: mobileTheme.panelSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
    marginBottom: 24,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: mobileTheme.borderSoft,
    minHeight: 52,
  },
  actionText: {
    flex: 1,
    color: mobileTheme.text,
    fontSize: 15,
    fontWeight: '600',
  },

  logoutButton: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(127, 29, 29, 0.24)',
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.2)',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  versionText: {
    textAlign: 'center',
    color: mobileTheme.textDim,
    fontSize: 11,
    marginBottom: 20,
  },
  themeSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  themeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
    backgroundColor: mobileTheme.panelSoft,
  },
  themeButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },
})

// aria-label
