import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAppStore } from '../stores/appStore'
import { useGuildStore } from '../stores/guildStore'
import { mobileTheme } from '../theme'

export default function GuildScreen() {
  const { profile } = useAppStore()
  const { currentGuild, isLoading, fetchMyGuild, createGuild } = useGuildStore()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGuildName, setNewGuildName] = useState('')

  useEffect(() => {
    fetchMyGuild()
  }, [fetchMyGuild])

  const handleCreateGuild = async () => {
    if (!newGuildName.trim()) return
    await createGuild({ name: newGuildName.trim(), isPrivate: false })
    setShowCreateModal(false)
    setNewGuildName('')
  }

  const hasGuild = !!profile?.guildId && !!currentGuild

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GUILD HALL</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!hasGuild ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-outline" size={64} color={mobileTheme.textDim} />
            <Text style={styles.emptyTitle}>No Guild Assigned</Text>
            <Text style={styles.emptySubtitle}>
              Join a guild to unlock cooperative raids, shared XP buffs, and the guild chat.
            </Text>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>BROWSE GUILDS</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => setShowCreateModal(true)}>
              <Text style={styles.secondaryButtonText}>CREATE A GUILD</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.guildWrapper}>
            <View style={styles.guildCard}>
              <View style={styles.guildHeaderRow}>
                <View style={styles.guildIcon}>
                  <Ionicons name="shield" size={32} color={mobileTheme.accent} />
                </View>
                <View style={styles.guildInfo}>
                  <Text style={styles.guildName}>{currentGuild?.name}</Text>
                  <Text style={styles.guildMeta}>
                    Level {currentGuild?.level} • Rank #{Math.floor(Math.random() * 100) + 1}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{currentGuild?.members?.length || 1}/{currentGuild?.capacity}</Text>
                  <Text style={styles.statLabel}>MEMBERS</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{currentGuild?.xp.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>GUILD XP</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Active Guild Quests</Text>
            <View style={styles.questCard}>
              <View style={styles.questHeader}>
                <Ionicons name="skull" size={16} color={mobileTheme.danger} />
                <Text style={styles.questTitle}>Defeat the Sloth Demon</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '65%' }]} />
              </View>
              <Text style={styles.questProgressText}>65% Completed</Text>
            </View>

            <Pressable style={styles.chatButton}>
              <Ionicons name="chatbubbles" size={20} color={mobileTheme.text} />
              <Text style={styles.chatButtonText}>ENTER GUILD CHAT</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Create Guild Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Form a New Guild</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={mobileTheme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>GUILD NAME</Text>
            <TextInput
              style={styles.textInput}
              placeholder="E.g. Shadow Monarchs"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={newGuildName}
              onChangeText={setNewGuildName}
              maxLength={20}
              autoCapitalize="words"
            />

            <TouchableOpacity 
              style={[styles.primaryButton, { marginTop: 20 }, (!newGuildName.trim() || isLoading) && styles.disabledButton]} 
              onPress={handleCreateGuild}
              disabled={!newGuildName.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={mobileTheme.text} />
              ) : (
                <Text style={styles.primaryButtonText}>ESTABLISH GUILD</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mobileTheme.background,
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyTitle: {
    color: mobileTheme.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  emptySubtitle: {
    color: mobileTheme.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 20,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: mobileTheme.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: mobileTheme.text,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  secondaryButton: {
    backgroundColor: mobileTheme.panelSoft,
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: mobileTheme.textMuted,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  guildWrapper: {
    gap: 20,
  },
  guildCard: {
    backgroundColor: mobileTheme.panel,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
  },
  guildHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  guildIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: mobileTheme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: mobileTheme.border,
  },
  guildInfo: {
    flex: 1,
  },
  guildName: {
    color: mobileTheme.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  guildMeta: {
    color: mobileTheme.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: mobileTheme.blackGlass,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    color: mobileTheme.text,
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: mobileTheme.textDim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
  },
  sectionTitle: {
    color: mobileTheme.textDim,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginLeft: 4,
  },
  questCard: {
    backgroundColor: mobileTheme.panelSoft,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  questTitle: {
    color: mobileTheme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: mobileTheme.blackGlass,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FCA5A5',
    borderRadius: 4,
  },
  questProgressText: {
    color: mobileTheme.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
  },
  chatButton: {
    backgroundColor: mobileTheme.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 10,
  },
  chatButtonText: {
    color: mobileTheme.text,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: mobileTheme.backgroundElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: mobileTheme.border,
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: mobileTheme.accent,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  inputLabel: {
    color: mobileTheme.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 1,
  },
  textInput: {
    backgroundColor: mobileTheme.panelSoft,
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
    borderRadius: 12,
    padding: 16,
    color: mobileTheme.text,
    fontSize: 16,
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
})
