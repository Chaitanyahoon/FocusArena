import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal,
  TextInput, ActivityIndicator, TouchableOpacity, FlatList, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useAppStore } from '../stores/appStore'
import { useGuildStore } from '../stores/guildStore'
import { signalRService } from '../services/signalr'
import { mobileTheme } from '../theme'
import type { Guild } from '../types'

export default function GuildScreen() {
  const navigation = useNavigation<any>()
  const { profile, auth } = useAppStore()
  const {
    currentGuild, searchResults, activeRaid, isLoading, raidLoading,
    fetchMyGuild, searchGuilds, createGuild, joinGuild, leaveGuild, fetchActiveRaid,
  } = useGuildStore()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBrowseModal, setShowBrowseModal] = useState(false)
  const [newGuildName, setNewGuildName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchMyGuild()
  }, [fetchMyGuild])

  useEffect(() => {
    if (currentGuild) {
      fetchActiveRaid()
      signalRService.joinGuild(currentGuild.id)
    }
  }, [currentGuild, fetchActiveRaid])

  const handleCreateGuild = async () => {
    if (!newGuildName.trim()) return
    await createGuild({ name: newGuildName.trim(), isPrivate: false })
    setShowCreateModal(false)
    setNewGuildName('')
  }

  const handleBrowse = () => {
    setShowBrowseModal(true)
    searchGuilds('')
  }

  const handleSearch = () => {
    searchGuilds(searchQuery)
  }

  const handleJoin = (guild: Guild) => {
    Alert.alert('Join Guild', `Join "${guild.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Join', onPress: () => { joinGuild(guild.id); setShowBrowseModal(false) } },
    ])
  }

  const handleLeave = () => {
    Alert.alert('Leave Guild', 'Are you sure you want to leave?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => leaveGuild() },
    ])
  }

  const hasGuild = !!profile?.guildId && !!currentGuild
  const raidHP = activeRaid ? Math.round((activeRaid.currentHP / activeRaid.totalHP) * 100) : 0

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
            <Pressable style={styles.primaryButton} onPress={handleBrowse}>
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
                  <Text style={styles.guildName}>{currentGuild.name}</Text>
                  <Text style={styles.guildMeta}>Level {currentGuild.level} • {currentGuild.members?.length || 1}/{currentGuild.capacity} members</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{currentGuild.members?.length || 1}/{currentGuild.capacity}</Text>
                  <Text style={styles.statLabel}>MEMBERS</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{currentGuild.xp.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>GUILD XP</Text>
                </View>
              </View>
            </View>

            {/* Active Raid */}
            <Text style={styles.sectionTitle}>ACTIVE RAID</Text>
            {raidLoading ? (
              <ActivityIndicator color={mobileTheme.accent} />
            ) : activeRaid ? (
              <View style={styles.questCard}>
                <View style={styles.questHeader}>
                  <Ionicons name="skull" size={16} color={mobileTheme.danger} />
                  <Text style={styles.questTitle}>{activeRaid.bossName || activeRaid.title}</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${raidHP}%` }]} />
                </View>
                <Text style={styles.questProgressText}>{activeRaid.currentHP}/{activeRaid.totalHP} HP remaining</Text>
              </View>
            ) : (
              <View style={styles.noRaidBox}>
                <Ionicons name="shield-checkmark-outline" size={24} color={mobileTheme.textDim} />
                <Text style={styles.noRaidText}>No active raid. The guild leader can start one.</Text>
              </View>
            )}

            {/* Guild Chat */}
            <Pressable style={styles.chatButton} onPress={() => navigation.navigate('GuildChat', { guildId: currentGuild.id, guildName: currentGuild.name })}>
              <Ionicons name="chatbubbles" size={20} color={mobileTheme.text} />
              <Text style={styles.chatButtonText}>ENTER GUILD CHAT</Text>
            </Pressable>

            {/* Leave Guild */}
            <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
              <Ionicons name="exit-outline" size={18} color={mobileTheme.danger} />
              <Text style={styles.leaveButtonText}>LEAVE GUILD</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Form a New Guild</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={mobileTheme.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>GUILD NAME</Text>
            <TextInput style={styles.textInput} placeholder="E.g. Shadow Monarchs" placeholderTextColor="rgba(255,255,255,0.3)" value={newGuildName} onChangeText={setNewGuildName} maxLength={20} autoCapitalize="words" />
            <TouchableOpacity style={[styles.primaryButton, { marginTop: 20 }, (!newGuildName.trim() || isLoading) && styles.disabledButton]} onPress={handleCreateGuild} disabled={!newGuildName.trim() || isLoading}>
              {isLoading ? <ActivityIndicator color={mobileTheme.text} /> : <Text style={styles.primaryButtonText}>ESTABLISH GUILD</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Browse Modal */}
      <Modal visible={showBrowseModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Browse Guilds</Text>
              <TouchableOpacity onPress={() => setShowBrowseModal(false)}>
                <Ionicons name="close" size={24} color={mobileTheme.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchRow}>
              <TextInput style={[styles.textInput, { flex: 1 }]} placeholder="Search guilds..." placeholderTextColor="rgba(255,255,255,0.3)" value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={handleSearch} />
              <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                <Ionicons name="search" size={20} color={mobileTheme.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={searchResults}
              keyExtractor={g => g.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.browseRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.browseName}>{item.name}</Text>
                    <Text style={styles.browseMeta}>Lv.{item.level} • {item.members?.length || '?'}/{item.capacity}</Text>
                  </View>
                  <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoin(item)}>
                    <Text style={styles.joinBtnText}>JOIN</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                isLoading ? <ActivityIndicator color={mobileTheme.accent} style={{ marginTop: 20 }} /> : <Text style={styles.browseEmpty}>No guilds found.</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: mobileTheme.background },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  headerTitle: { color: mobileTheme.accent, fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  content: { paddingHorizontal: 20, paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { color: mobileTheme.text, fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  emptySubtitle: { color: mobileTheme.textMuted, fontSize: 14, textAlign: 'center', paddingHorizontal: 30, lineHeight: 20, marginBottom: 20 },
  primaryButton: { backgroundColor: mobileTheme.accent, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 16, width: '100%', alignItems: 'center' },
  primaryButtonText: { color: mobileTheme.text, fontSize: 13, fontWeight: '900', letterSpacing: 1.5 },
  secondaryButton: { backgroundColor: mobileTheme.panelSoft, borderWidth: 1, borderColor: mobileTheme.borderSoft, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 16, width: '100%', alignItems: 'center' },
  secondaryButtonText: { color: mobileTheme.textMuted, fontSize: 13, fontWeight: '900', letterSpacing: 1.5 },
  guildWrapper: { gap: 20 },
  guildCard: { backgroundColor: mobileTheme.panel, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: mobileTheme.borderSoft },
  guildHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  guildIcon: { width: 60, height: 60, borderRadius: 16, backgroundColor: mobileTheme.accentSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: mobileTheme.border },
  guildInfo: { flex: 1 },
  guildName: { color: mobileTheme.text, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  guildMeta: { color: mobileTheme.accent, fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: mobileTheme.blackGlass, padding: 12, borderRadius: 12, alignItems: 'center' },
  statValue: { color: mobileTheme.text, fontSize: 18, fontWeight: '800' },
  statLabel: { color: mobileTheme.textDim, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginTop: 4 },
  sectionTitle: { color: mobileTheme.textDim, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 4 },
  questCard: { backgroundColor: mobileTheme.panelSoft, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: mobileTheme.borderSoft },
  questHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  questTitle: { color: mobileTheme.text, fontSize: 15, fontWeight: '700' },
  progressBarBg: { height: 8, backgroundColor: mobileTheme.blackGlass, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', backgroundColor: '#FCA5A5', borderRadius: 4 },
  questProgressText: { color: mobileTheme.textMuted, fontSize: 11, fontWeight: '600', textAlign: 'right' },
  noRaidBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: mobileTheme.panelSoft, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: mobileTheme.borderSoft },
  noRaidText: { color: mobileTheme.textMuted, fontSize: 13, flex: 1, lineHeight: 18 },
  chatButton: { backgroundColor: mobileTheme.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16 },
  chatButtonText: { color: mobileTheme.text, fontSize: 13, fontWeight: '900', letterSpacing: 1.5 },
  leaveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(127,29,29,0.24)', borderWidth: 1, borderColor: 'rgba(251,113,133,0.2)', borderRadius: 14, paddingVertical: 14 },
  leaveButtonText: { color: mobileTheme.danger, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: mobileTheme.backgroundElevated, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: mobileTheme.border, borderBottomWidth: 0 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: mobileTheme.accent, fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  inputLabel: { color: mobileTheme.textMuted, fontSize: 12, fontWeight: '800', marginBottom: 8, letterSpacing: 1 },
  textInput: { backgroundColor: mobileTheme.panelSoft, borderWidth: 1, borderColor: mobileTheme.borderSoft, borderRadius: 12, padding: 16, color: mobileTheme.text, fontSize: 16, marginBottom: 16 },
  disabledButton: { opacity: 0.5 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  searchBtn: { width: 50, height: 50, borderRadius: 12, backgroundColor: mobileTheme.accent, alignItems: 'center', justifyContent: 'center' },
  browseRow: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: mobileTheme.panelSoft, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: mobileTheme.borderSoft },
  browseName: { color: mobileTheme.text, fontSize: 15, fontWeight: '700' },
  browseMeta: { color: mobileTheme.textDim, fontSize: 11, marginTop: 2 },
  joinBtn: { backgroundColor: mobileTheme.accent, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  joinBtnText: { color: mobileTheme.text, fontSize: 12, fontWeight: '900' },
  browseEmpty: { color: mobileTheme.textDim, textAlign: 'center', marginTop: 20, fontSize: 14 },
})
